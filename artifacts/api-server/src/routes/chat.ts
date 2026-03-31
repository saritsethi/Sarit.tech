import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  conversations as conversationsTable,
  messages as messagesTable,
  outOfScopeQueries,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { createClient } from "@sanity/client";
import { PostHog } from "posthog-node";
import { retrieveContext, formatContextBlock } from "../rag/retrieve";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Sanity client — read-only, fetches live content for system prompt injection
// ---------------------------------------------------------------------------

const PROJECT_ID = process.env.SANITY_PROJECT_ID || "";
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || "";
const sanityReady = PROJECT_ID !== "" && PROJECT_ID !== "placeholder";

const sanityClient = sanityReady
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      useCdn: true,
      apiVersion: "2024-01-01",
      token: TOKEN,
    })
  : null;

// ---------------------------------------------------------------------------
// PostHog — server-side event tracking for out-of-scope query logging
// ---------------------------------------------------------------------------

const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = "https://us.i.posthog.com";

const posthog = POSTHOG_KEY
  ? new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST, flushAt: 1, flushInterval: 0 })
  : null;

const REFUSAL_PHRASE = "I don't have that specific data in my current knowledge base";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SanityBlock {
  children?: Array<{ text?: string }>;
}

interface TimelineEntry {
  year?: string;
  title?: string;
  company?: string;
  description?: string;
}

interface Pillar {
  title?: string;
  description?: string;
}

interface Metric {
  value?: string;
  label?: string;
  description?: string;
}

interface Project {
  title?: string;
  description?: SanityBlock[];
  technologies?: string[];
  tech?: string[];
  status?: string;
}

interface SanityContent {
  narrative: string[];
  cricketStats: Array<{ aspect?: string; value?: string }>;
  strategyTitle: string;
  aiPillars: Pillar[];
  keyMetrics: Metric[];
  missionStatement: string;
  quote: string;
  timeline: TimelineEntry[];
  projects: Project[];
  calendarUrl: string;
  substackUrl: string;
  linkedinUrl: string;
}

function blocksToText(blocks?: SanityBlock[]): string[] {
  if (!blocks?.length) return [];
  return blocks
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// In-memory cache for Sanity context — refreshed every 60 s
// ---------------------------------------------------------------------------

interface SanityContextCache {
  data: SanityContent;
  expiresAt: number;
}
let _sanityCache: SanityContextCache | null = null;
const SANITY_CACHE_TTL_MS = 60_000;

// ---------------------------------------------------------------------------
// Fetch live context from Sanity (served from cache after first load)
// ---------------------------------------------------------------------------

async function fetchSanityContext(): Promise<SanityContent> {
  if (_sanityCache && Date.now() < _sanityCache.expiresAt) {
    return _sanityCache.data;
  }
  const fallback: SanityContent = {
    narrative: [
      "A global citizen who has lived and worked in Delhi, Toronto, and Chicago, drawing a broad worldview from these diverse cultural and professional hubs.",
      "I balance the excitement of AI's potential with a grounded concern for its pervasiveness. I focus on building a rich personality through physical experiences while preparing for a world shaped by technology.",
      "As a father to a two-year-old, I am grappling with the architecture of the world my son will inherit. In a world of digital saturation, my goal is to ensure my son comes home with dirt on his pants rather than keys impressed on his fingertips.",
      "Co-authored a poetry collection with my wife, Neetika Wahi, exploring emotions, relationships, and introspection. Written in the AI era without AI — a testament to human authenticity.",
    ],
    cricketStats: [
      { aspect: "Obsession Level", value: "Professional" },
      { aspect: "Second Office", value: "The 22 yards" },
      { aspect: "Style", value: "Strategy, precision, and endurance" },
      { aspect: "Book", value: "From Our Veranda — co-authored with Neetika Wahi" },
    ],
    strategyTitle: "Enterprise AI Strategy: The Three Buckets",
    aiPillars: [
      { title: "Measurable Agentic Automation", description: "Prioritizing Hero Workflows with obvious automation potential and measurable ROI. Agentic systems performing complex tasks autonomously within guarded parameters." },
      { title: "AI Literacy & Bridging", description: "Providing the workforce with tools to build familiarity and serve as a bridge to a more mature AI future." },
      { title: "Responsible AI & Risk Mitigation", description: "Grounding outcomes in high-quality enterprise data and including Human-in-the-Loop where necessary to ensure safety and contextual accuracy." },
    ],
    keyMetrics: [
      { value: "200K+", label: "Monthly Interactions", description: "Production-grade AI automation interactions delivered at a Fortune 200 Enterprise" },
      { value: "$1B", label: "Revenue Influenced", description: "Revenue generation influenced through AI-empowered pursuit strategies" },
      { value: "$10M", label: "ARR Built", description: "Annual revenue scaled from zero at Archer Technologies" },
    ],
    missionStatement: "Bridging the visibility gap between executive intent and engineering execution to prevent Strategic Failure in AI implementations.",
    quote: "Leadership is about providing clarity in chaos. My approach combines the rigorous discipline of an engineer with the adaptive agility of a product leader, ensuring that every technological shift is grounded in human value.",
    timeline: [
      { year: "2024–2026", title: "Product Management Director", company: "Fortune 200 Enterprise", description: "Spearheaded global enterprise AI roadmaps. Delivered production-grade automation reaching 200,000+ monthly interactions and enabling safe, enterprise-data-grounded artifact creation." },
      { year: "2022–2024", title: "Senior Product Manager", company: "Fortune 200 Enterprise", description: "Led a portfolio of seven products and a 30-person team, influencing $1B in revenue generation and significantly improving pursuit win rates through AI empowerment." },
      { year: "2016–2021", title: "Co-Founder & CPO/COO", company: "Archer Technologies", description: "Scaled multiple construction SaaS solutions from zero to $10M in annual revenue with a 60-member team." },
      { year: "2014–2016", title: "Co-Founder", company: "LetzSLAB", description: "Launched a peer-to-peer equipment sharing platform for the construction industry with 11,000+ listings." },
      { year: "2010–2014", title: "Project & Design Manager", company: "M+W Group", description: "Directed the design and construction of massive industrial facilities for global clients like Michelin and Dana." },
      { year: "2007–2009", title: "Architect Team Leader", company: "IAAD", description: "Pioneered the conceptual design for GIFT City and large-scale automatic infrastructure projects in India." },
    ],
    projects: [
      { title: "SARTH(A)i: Enterprise AI Alignment", description: [{ children: [{ text: "Bridging the visibility gap between executive intent and engineering execution to prevent Strategic Failure in AI implementations. An active governance architecture for enterprise AI programs." }] }], technologies: ["AI Governance", "Enterprise Architecture", "Product Strategy", "RAG"], status: "active" },
      { title: "CricketIQ: Expert AI Coaching", description: [{ children: [{ text: "Access to expert-level cricket intelligence through multi-modal RAG systems grounded in real match data and vision analysis. Built and deployed on Replit." }] }], technologies: ["Gemini Pro", "RAG", "Computer Vision", "Replit"], status: "active" },
      { title: "HomeDecider: Data-Driven Real Estate", description: [{ children: [{ text: "Smarter Rent vs. Buy decisions using live market data from FRED and neighborhood analysis. Built and deployed on Streamlit." }] }], technologies: ["Python", "Streamlit", "FRED API", "Data Analysis"], status: "active" },
      { title: "Job Application Agent", description: [{ children: [{ text: "An 8-step autonomous agentic workflow that hunts, scores, and applies to jobs on your behalf — running on a cron every 2 days. Multi-source job search across LinkedIn, Indeed, Glassdoor, and company career pages, AI scoring engine, deep URL validation, and curated email digests. Built with Mastra and OpenAI on Replit." }] }], technologies: ["Mastra", "OpenAI", "Replit", "PostgreSQL", "Google Sheets", "Node.js"], status: "active" },
    ],
    calendarUrl: "https://calendar.app.google/Xh2ruF2wWSN8Y2JP9",
    substackUrl: "https://substack.com/@saritsethi",
    linkedinUrl: "https://linkedin.com/in/saritsethi",
  };

  if (!sanityClient) return fallback;

  try {
    const [about, leadership, timeline, pillars, projects, settings] =
      await Promise.all([
        sanityClient.fetch<Record<string, unknown>>(
          '*[_id=="singleton-about"][0]{ narrative, cricketStats }',
        ),
        sanityClient.fetch<Record<string, unknown>>(
          '*[_id=="singleton-leadership"][0]{ strategyTitle, aiPillars, keyMetrics, missionStatement, quote }',
        ),
        sanityClient.fetch<TimelineEntry[]>(
          '*[_type=="timeline"]|order(order asc){ year, title, company, description }',
        ),
        sanityClient.fetch<Pillar[]>(
          '*[_type=="strategyPillar"]|order(order asc){ title, description }',
        ),
        sanityClient.fetch<Project[]>(
          '*[_type=="project"]|order(order asc){ title, description, technologies, tech, status }',
        ),
        sanityClient.fetch<Record<string, unknown>>(
          '*[_id=="singleton-siteSettings"][0]{ calendarBookingUrl, substackUrl, linkedinUrl }',
        ),
      ]);

    const narrative = blocksToText(
      about?.narrative as SanityBlock[] | undefined,
    );

    const result: SanityContent = {
      narrative: narrative.length ? narrative : fallback.narrative,
      cricketStats:
        (about?.cricketStats as SanityContent["cricketStats"]) ??
        fallback.cricketStats,
      strategyTitle:
        (leadership?.strategyTitle as string) ?? fallback.strategyTitle,
      aiPillars:
        ((leadership?.aiPillars as Pillar[]) ?? []).length > 0
          ? (leadership?.aiPillars as Pillar[])
          : pillars.length > 0
            ? pillars
            : fallback.aiPillars,
      keyMetrics:
        ((leadership?.keyMetrics as Metric[]) ?? []).length > 0
          ? (leadership?.keyMetrics as Metric[])
          : fallback.keyMetrics,
      missionStatement:
        (leadership?.missionStatement as string) ?? fallback.missionStatement,
      quote: (leadership?.quote as string) ?? fallback.quote,
      timeline: timeline.length ? timeline : fallback.timeline,
      projects: projects.length ? projects : fallback.projects,
      calendarUrl:
        (settings?.calendarBookingUrl as string) ?? fallback.calendarUrl,
      substackUrl:
        (settings?.substackUrl as string) ?? fallback.substackUrl,
      linkedinUrl:
        (settings?.linkedinUrl as string) ?? fallback.linkedinUrl,
    };
    _sanityCache = { data: result, expiresAt: Date.now() + SANITY_CACHE_TTL_MS };
    return result;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Build rich, dynamic system prompt from live Sanity content
// ---------------------------------------------------------------------------

function buildSystemPrompt(ctx: SanityContent): string {
  const careerHistory = ctx.timeline
    .map(
      (t) =>
        `  • ${t.year} — ${t.title}${t.company ? `, ${t.company}` : ""}${t.description ? `\n    ${t.description}` : ""}`,
    )
    .join("\n");

  const pillarsText = ctx.aiPillars
    .map((p) => `  • **${p.title}:** ${p.description}`)
    .join("\n");

  const metricsText = ctx.keyMetrics
    .map((m) => `  • **${m.value} ${m.label}** — ${m.description}`)
    .join("\n");

  const projectsText = ctx.projects
    .map((p) => {
      const desc = blocksToText(p.description).join(" ");
      const tech = (p.technologies ?? p.tech ?? []).join(", ");
      return `  • **${p.title}**${tech ? ` [${tech}]` : ""}${desc ? `\n    ${desc}` : ""}`;
    })
    .join("\n");

  const cricketText = ctx.cricketStats
    .map((s) => `${s.aspect}: ${s.value}`)
    .join(" · ");

  const narrativeText = ctx.narrative.join("\n\n");

  return `# ROLE: Digital Twin of Sarit Sethi
You are the interactive, AI-powered extension of Sarit Sethi — an AI Product Director, Builder, and "AI Dad." Your mission is to provide high-value, grounded insights into Sarit's professional frameworks, career journey, and personal interests. You speak in first person as Sarit at all times.

---

## 1. CORE OPERATING CONSTRAINTS

- **Groundedness:** Every response must be derived strictly from the data provided in this prompt. Do not hallucinate facts, metrics, company names, or credentials that are not explicitly listed below.
- **Scope Restriction:** You only answer questions related to Sarit Sethi's life, career, projects (Sarth(A)i, Cricket Coach AI), frameworks, and expertise. Stay within this scope.
- **Refusal Protocol:** For questions unrelated to Sarit, or questions you cannot answer accurately from the data below, respond with: "I don't have that specific data in my current knowledge base. To get a definitive answer on this, you should reach out to Sarit directly." Then provide: [saritsethi@gmail.com](mailto:saritsethi@gmail.com) | [Book a call](${ctx.calendarUrl})
- **No hallucination:** If a specific detail (company name, date, figure) is not in this prompt, say you don't have it rather than guessing.

---

## 2. TONE & VOICE (The "Sarit" Persona)

- **Direct & ROI-Focused:** Speak like a Product Director. Lead with value, scalability, and "the build." Every answer should have a practical takeaway.
- **Industrial Minimalist:** Use clear, scannable formatting — bullet points, bold text for key terms. Avoid fluff or overly flowery language.
- **Tech-Savvy Analogies:** Use construction or engineering metaphors to explain complex AI or product concepts. Examples: "plumbing" for data pipelines, "foundations" for data strategy, "blueprints" for product roadmaps, "load-bearing walls" for critical systems.
- **The "AI Dad" Balance:** Maintain a professional executive tone but stay grounded. Acknowledge the human side — Chicago life, being a father, cricket obsession — when contextually appropriate, not gratuitously.

---

## 3. RESPONSE STRUCTURE & FORMATTING

- **Source Citations:** Always cite the source of your information inline. Use: [Source: Career History], [Source: Projects], [Source: AI Framework], [Source: Personal/Cricket], [Source: Metrics].
- **Brevity is King:** Keep responses concise and "Director-level." Aim for under 150 words. Provide depth only when explicitly requested ("tell me more", "go deeper", "explain").
- **Link Formatting:** Always format URLs and emails as markdown links — never output bare URLs or bare email addresses. Use: [Display Text](url) for URLs and [email@address.com](mailto:email@address.com) for emails.
- **Multi-Turn Engagement:** Always end every response with a single, contextually relevant follow-up question that encourages deeper exploration. Examples: "Would you like to see the ROI framework I applied to the Enterprise RAG deployment?" or "Curious about how I balanced the technical and stakeholder sides of that transformation?"

---

## 4. KNOWLEDGE DOMAINS

### Professional
- **AI Strategy & Product Leadership:** ${ctx.missionStatement}
- **Personal philosophy:** "${ctx.quote}"
- **AI Leadership Framework (${ctx.strategyTitle}):**
${pillarsText}
- **Proven Results:**
${metricsText}
- **Career History:**
${careerHistory}
- **Domain expertise:** AI Strategy, Construction Technology (ConTech), Geospatial Services, Enterprise Alignment, Product Leadership, ROI-First Thinking, Go-to-Market for AI, Stakeholder & Executive Communication, Digital Twins, RAG Systems.

### Projects
${projectsText}

### Personal
- **Location journey:** Born and raised in Delhi, India → Built career in Toronto, Canada (construction tech) → Now based in Chicago, leading enterprise AI strategy. [Source: Personal/Bio]
- **Background narrative:** ${narrativeText}
- **Cricket:** ${cricketText}. Cricket informs Sarit's product instincts — patience, reading the field, and knowing when to improvise vs. execute on technique. [Source: Personal/Cricket]
- **"AI Dad":** Being a father is core to how Sarit thinks about technology. He builds for durability, not just impressiveness. His toddler is his most rigorous user-tester for simplicity and clarity.
- **Writing:** Sarit publishes on AI product leadership and construction tech transformation at [Substack](${ctx.substackUrl}). [Source: Substack]

### Contact & Links
- **Schedule a call:** [Book a Strategy Call](${ctx.calendarUrl})
- **LinkedIn:** [LinkedIn Profile](${ctx.linkedinUrl})
- **Substack:** [Substack](${ctx.substackUrl})
- **Email:** [saritsethi@gmail.com](mailto:saritsethi@gmail.com)`;
}

// ---------------------------------------------------------------------------
// Starter prompts — GET /api/chat/starter-prompts
// Dynamically generated from Sanity context via Gemini
// ---------------------------------------------------------------------------

router.get("/chat/starter-prompts", async (_req, res) => {
  try {
    const ctx = await fetchSanityContext();

    const topicsSnapshot = [
      ctx.strategyTitle,
      ...ctx.aiPillars.map((p) => p.title).filter(Boolean),
      ...ctx.keyMetrics.map((m) => `${m.value} ${m.label}`).filter(Boolean),
      ...ctx.timeline.slice(0, 3).map((t) => `${t.title} at ${t.company}`),
      ...ctx.projects.slice(0, 3).map((p) => p.title).filter(Boolean),
    ]
      .filter(Boolean)
      .join(", ");

    const promptGenInstruction = `You are generating conversation starter suggestions for a visitor to Sarit Sethi's personal portfolio. Sarit is an AI Product Director based in Chicago with deep expertise in enterprise AI strategy, construction technology, product leadership, and is also known as "The AI Dad" — a father who thinks carefully about technology's role in his child's life.

Key topics in Sarit's knowledge base: ${topicsSnapshot}

Generate exactly 3 short, specific, compelling starter questions that a recruiter, collaborator, or curious visitor would genuinely want to ask Sarit's AI digital twin. Each prompt must:
- Be answerable from the knowledge base (career, AI strategy, projects, personal story)
- Be concise (under 12 words each)
- Feel natural to click — phrased as a genuine human question
- Vary in topic (professional framework, personal story, specific project)
- NOT start with "What is" — use more engaging openers

Return ONLY a JSON array of 3 strings, nothing else. Example format:
["prompt one", "prompt two", "prompt three"]`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: promptGenInstruction }] }],
    });
    const raw = (result.text ?? "").trim();

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");

    const prompts = JSON.parse(jsonMatch[0]) as string[];
    if (!Array.isArray(prompts) || prompts.length < 3) throw new Error("Invalid prompts array");

    res.json({ prompts: prompts.slice(0, 3) });
  } catch (err) {
    console.error("[starter-prompts] Failed to generate:", err);
    res.status(500).json({ error: "Failed to generate starter prompts" });
  }
});

// ---------------------------------------------------------------------------
// Chat route — POST /api/chat
// ---------------------------------------------------------------------------

router.post("/chat", async (req, res) => {
  const { message, conversationId: rawConvId } = req.body as {
    message?: unknown;
    conversationId?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    res
      .status(400)
      .json({ error: "message is required and must be a non-empty string" });
    return;
  }

  const existingConvId =
    rawConvId !== undefined &&
    typeof rawConvId === "number" &&
    Number.isInteger(rawConvId) &&
    rawConvId > 0
      ? rawConvId
      : undefined;

  let conversationId = existingConvId;
  let isNewConversation = false;

  if (!conversationId) {
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title: "Chat Session" })
      .returning();
    conversationId = conv.id;
    isNewConversation = true;
  } else {
    const existing = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .limit(1);
    if (!existing[0]) {
      const [conv] = await db
        .insert(conversationsTable)
        .values({ title: "Chat Session" })
        .returning();
      conversationId = conv.id;
      isNewConversation = true;
    }
  }

  const [userMsgRow] = await db.insert(messagesTable).values({
    conversationId,
    role: "user",
    content: message,
  }).returning();

  const [allMessages, sanityContext, ragChunks] = await Promise.all([
    db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId!))
      .orderBy(messagesTable.createdAt),
    fetchSanityContext(),
    retrieveContext(message).catch((err) => {
      console.warn("[RAG] Retrieval failed (continuing without):", err);
      return [];
    }),
  ]);

  const ragContextBlock = formatContextBlock(ragChunks);
  const systemPrompt = buildSystemPrompt(sanityContext) +
    (ragContextBlock ? `\n\n${ragContextBlock}` : "");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);

  let fullResponse = "";

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: allMessages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })),
    config: {
      maxOutputTokens: 600,
      systemInstruction: systemPrompt,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
  }

  await db.insert(messagesTable).values({
    conversationId,
    role: "assistant",
    content: fullResponse,
  });

  // -------------------------------------------------------------------------
  // Analytics — fire chatbot_query to PostHog for every user message
  // -------------------------------------------------------------------------
  const convIdStr = conversationId?.toString() ?? null;
  const isOutOfScope = fullResponse.includes(REFUSAL_PHRASE);

  if (isOutOfScope) {
    // Keep legacy out-of-scope event for backwards-compatible PostHog views
    db.insert(outOfScopeQueries)
      .values({ query: message, conversationId: convIdStr })
      .catch((err: unknown) => console.error("[out-of-scope] DB insert failed:", err));

    if (posthog) {
      posthog.capture({
        distinctId: `conversation-${convIdStr ?? "unknown"}`,
        event: "chatbot_out_of_scope",
        properties: {
          query: message,
          conversationId: convIdStr,
          responsePreview: fullResponse.slice(0, 200),
        },
      });
    }
  }

  // Fire comprehensive chatbot_query event for every message
  if (posthog) {
    posthog.capture({
      distinctId: `conversation-${convIdStr ?? "unknown"}`,
      event: "chatbot_query",
      properties: {
        query: message,
        conversationId: convIdStr,
        isNewConversation,
        isOutOfScope,
        responseLengthChars: fullResponse.length,
      },
    });
  }

  // Mark the user message row as synced to PostHog (prevents duplicate backfill)
  if (userMsgRow?.id) {
    db.update(messagesTable)
      .set({ posthogSynced: true })
      .where(eq(messagesTable.id, userMsgRow.id))
      .catch((err: unknown) => console.error("[analytics] posthog_synced update failed:", err));
  }

  res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
  res.end();
});

// ---------------------------------------------------------------------------
// Report endpoint — GET /api/chat/out-of-scope
// Returns all logged out-of-scope queries, newest first
// ---------------------------------------------------------------------------

router.get("/chat/out-of-scope", async (_req, res) => {
  const rows = await db
    .select()
    .from(outOfScopeQueries)
    .orderBy(desc(outOfScopeQueries.createdAt));

  const total = rows.length;
  const last7Days = rows.filter((r) => {
    const age = Date.now() - new Date(r.createdAt).getTime();
    return age < 7 * 24 * 60 * 60 * 1000;
  }).length;

  res.json({
    summary: { total, last7Days },
    queries: rows.map((r) => ({
      id: r.id,
      query: r.query,
      conversationId: r.conversationId,
      timestamp: r.createdAt,
    })),
  });
});

export default router;
