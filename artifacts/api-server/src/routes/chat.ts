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
// Fetch live context from Sanity (cached per request — ~100ms overhead)
// ---------------------------------------------------------------------------

async function fetchSanityContext(): Promise<SanityContent> {
  const fallback: SanityContent = {
    narrative: [
      "From the construction sites of Toronto to the AI boardrooms of Chicago — my journey is one of relentless translation. I've always sat at the uncomfortable intersection of the deeply technical and the strategically human.",
      "As a product leader, I architect realistic, scalable, and ethical pathways for AI adoption in industries that others write off as 'too legacy.' I don't just advocate for AI — I make it work.",
    ],
    cricketStats: [
      { aspect: "Batting Style", value: "Right-handed" },
      { aspect: "Favourite Shot", value: "Cover drive" },
      { aspect: "Role", value: "Opening batsman" },
      { aspect: "Club", value: "Chicago Cricket Club" },
    ],
    strategyTitle: "My AI Leadership Framework",
    aiPillars: [
      { title: "ROI-First Discovery", description: "Aligning AI capabilities with quantifiable business outcomes. No tech for tech's sake." },
      { title: "Cross-Functional Alignment", description: "Bridging engineering, design, and executive stakeholders to ensure adoption and real-world impact." },
      { title: "Scalable Architecture", description: "Designing systems that grow with the enterprise, prioritizing security, modularity, and maintainability." },
      { title: "Ethical AI Deployment", description: "Ensuring models are transparent, unbiased, and compliant with evolving global regulations." },
    ],
    keyMetrics: [
      { value: "40%", label: "Cost Reduction", description: "Average operational cost reduction across deployments" },
      { value: "10K+", label: "Users Impacted", description: "Professionals using AI tools I shipped" },
      { value: "87%", label: "Adoption Rate", description: "Enterprise AI adoption rate vs 34% industry average" },
    ],
    missionStatement: "I don't just build AI products — I teach them to think like humans, and teach humans to think like engineers.",
    quote: "The best AI strategy isn't the most complex one — it's the one your team actually uses.",
    timeline: [
      { year: "2023 - Present", title: "AI Product Leader", company: "Enterprise AI Solutions", description: "Spearheading ROI-driven AI deployments for Fortune 500 companies. Architecting Digital Twins and RAG-based systems that reduce operational bottlenecks by 40%." },
      { year: "2020 - 2023", title: "Head of Product", company: "Construction Tech Innovators · Chicago", description: "Led the digital transformation of legacy construction workflows. Bridged the gap between field execution and boardroom strategy." },
      { year: "2016 - 2020", title: "Senior Product Manager", company: "BuildCorp · Toronto", description: "Managed a portfolio of predictive analytics tools for project lifecycle management, resulting in a 25% increase in resource efficiency." },
      { year: "2012 - 2016", title: "Product Analyst", company: "Tech Ventures · Delhi", description: "Started as an analyst at a product consultancy in Delhi, learning the foundations of user research, agile delivery, and technology strategy." },
    ],
    projects: [
      { title: "Cricket Coach AI", description: [{ children: [{ text: "An AI-powered coaching assistant that analyzes batting/bowling technique via video, generates personalized training plans, and tracks performance metrics over time." }] }], technologies: ["Python", "Computer Vision", "Gemini Pro", "React Native"], status: "active" },
      { title: "Sarth(A)i", description: [{ children: [{ text: "A next-generation AI assistant platform designed to serve as a personal digital twin for knowledge workers — remembering context, drafting decisions, and surfacing insights." }] }], technologies: ["LangChain", "Vector DB", "FastAPI", "React"], status: "active" },
      { title: "Enterprise RAG System", description: [{ children: [{ text: "Secure, scalable retrieval-augmented generation pipeline deployed across a 10,000+ employee organization to unify internal knowledge and cut answer time by 60%." }] }], technologies: ["Gemini Pro", "Pinecone", "FastAPI", "Docker"], status: "active" },
    ],
    calendarUrl: "https://calendar.app.google/PTXjuRKDb97Qyp3B6",
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

    return {
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
- **Refusal Protocol:** For questions unrelated to Sarit, or questions you cannot answer accurately from the data below, respond with: "I don't have that specific data in my current knowledge base. To get a definitive answer on this, you should reach out to Sarit directly." Then provide: Email: hello@sarit.tech | Calendar: ${ctx.calendarUrl}
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
- **Writing:** Sarit publishes on AI product leadership and construction tech transformation at ${ctx.substackUrl}. [Source: Substack]

### Contact & Links
- **Schedule a call:** ${ctx.calendarUrl}
- **LinkedIn:** ${ctx.linkedinUrl}
- **Substack:** ${ctx.substackUrl}
- **Email:** hello@sarit.tech`;
}

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

  if (!conversationId) {
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title: "Chat Session" })
      .returning();
    conversationId = conv.id;
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
    }
  }

  await db.insert(messagesTable).values({
    conversationId,
    role: "user",
    content: message,
  });

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
      maxOutputTokens: 8192,
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
  // Out-of-scope detection — log to PostHog + DB if refusal phrase triggered
  // -------------------------------------------------------------------------
  if (fullResponse.includes(REFUSAL_PHRASE)) {
    const convIdStr = conversationId?.toString() ?? null;

    // Fire-and-forget: DB insert
    db.insert(outOfScopeQueries)
      .values({ query: message, conversationId: convIdStr })
      .catch((err: unknown) => console.error("[out-of-scope] DB insert failed:", err));

    // Fire-and-forget: PostHog event
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
