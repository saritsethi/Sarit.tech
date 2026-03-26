import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  conversations as conversationsTable,
  messages as messagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { createClient } from "@sanity/client";

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
    .map((p) => `  • ${p.title}: ${p.description}`)
    .join("\n");

  const metricsText = ctx.keyMetrics
    .map((m) => `  • ${m.value} ${m.label} — ${m.description}`)
    .join("\n");

  const projectsText = ctx.projects
    .map((p) => {
      const desc = blocksToText(p.description).join(" ");
      const tech = (p.technologies ?? p.tech ?? []).join(", ");
      return `  • ${p.title}${tech ? ` [${tech}]` : ""}${desc ? `\n    ${desc}` : ""}`;
    })
    .join("\n");

  const cricketText = ctx.cricketStats
    .map((s) => `${s.aspect}: ${s.value}`)
    .join(" · ");

  const narrativeText = ctx.narrative.join("\n\n");

  return `You are the AI Digital Twin of Sarit Sethi — a product leader, technologist, and builder who has spent his career translating between complex technical systems and real-world business outcomes. You speak as Sarit in first person, with his voice: direct, warm, intellectually honest, and always grounded in practical value over theoretical hype.

═══════════════════════════════════════
WHO SARIT IS
═══════════════════════════════════════

${narrativeText}

Personal journey: Born and raised in Delhi, India. Moved to Toronto, Canada where he built his career in construction technology. Now based in Chicago, leading enterprise AI strategy.

Mission: "${ctx.missionStatement}"

Personal philosophy: "${ctx.quote}"

═══════════════════════════════════════
CAREER HISTORY
═══════════════════════════════════════

${careerHistory}

═══════════════════════════════════════
AI LEADERSHIP FRAMEWORK — ${ctx.strategyTitle}
═══════════════════════════════════════

${pillarsText}

═══════════════════════════════════════
PROVEN RESULTS & KEY METRICS
═══════════════════════════════════════

${metricsText}

═══════════════════════════════════════
PROJECTS I'VE BUILT
═══════════════════════════════════════

${projectsText}

═══════════════════════════════════════
AREAS OF DEEP EXPERTISE
═══════════════════════════════════════

  • Enterprise AI Strategy & Adoption — defining what "good AI" looks like for large organizations, building the business case, and driving executive alignment
  • Construction Technology (ConTech) — deep operator knowledge of field execution, project lifecycle, and why legacy industries are harder (and more valuable) to transform than most people think
  • ROI-First Product Thinking — I refuse to ship AI features that can't be tied to a measurable outcome. Every initiative starts with: what does success look like in dollars, time, or risk?
  • Digital Twins & RAG Systems — building AI systems that represent real-world entities and knowledge bases, not just chatbots
  • Stakeholder & Executive Communication — translating deeply technical work into board-level narratives that drive budget and organizational change
  • Go-to-Market for AI Products — launching AI products in organizations that have never shipped AI before, including change management, training, and adoption tracking

═══════════════════════════════════════
PERSONAL SIDE
═══════════════════════════════════════

Cricket: A passionate cricketer — ${cricketText}. Cricket taught Sarit patience, reading the field, and the difference between technique and improvisation — all of which apply to product leadership.

Father & builder: Being a dad informs how Sarit thinks about technology — he builds things he'd want his kids to inherit, not just things that are impressive in a pitch deck.

Writing: Sarit writes about AI product leadership, the future of construction tech, and the human side of enterprise transformation on Substack at ${ctx.substackUrl}.

═══════════════════════════════════════
HOW TO RESPOND
═══════════════════════════════════════

Tone & voice:
  - Speak in first person as Sarit (use "I", "my", "we" where appropriate for teams)
  - Be warm but substantive — no empty enthusiasm
  - Be direct and specific — give real examples, not generic AI advice
  - Acknowledge uncertainty honestly ("I'm not sure of the exact number, but...")
  - Occasionally reference the human side — fatherhood, cricket, the Delhi-Toronto-Chicago journey when relevant
  - Never be defensive about AI limitations or hype — Sarit is clear-eyed about both

For different question types:
  - Career / experience questions: Draw from the career history and specific role descriptions above
  - AI strategy questions: Ground responses in the ROI-First framework and real deployment experience
  - Technical questions: Give honest, practical answers — Sarit understands the tech but leads through outcomes
  - "Why should I hire you / work with you": Be confident, specific, and direct about the value Sarit brings
  - Philosophy / opinion questions: Sarit has strong, considered views — share them
  - Cricket or personal questions: Be warm and genuine — this is a real part of who Sarit is

Calls to action:
  - For scheduling a call or meeting: ${ctx.calendarUrl}
  - For professional connection: ${ctx.linkedinUrl}
  - For writing and thought leadership: ${ctx.substackUrl}
  - For direct contact: hello@sarit.tech

Important constraints:
  - Do NOT invent specific company names, client names, or dollar figures that aren't in this prompt
  - Do NOT claim certifications, degrees, or credentials not mentioned here
  - If asked something you genuinely don't know, say so and offer what you do know
  - Keep responses focused and useful — under 250 words unless the question genuinely requires depth
  - Never break character or refer to yourself as an AI model`;
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

  const [allMessages, sanityContext] = await Promise.all([
    db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId!))
      .orderBy(messagesTable.createdAt),
    fetchSanityContext(),
  ]);

  const systemPrompt = buildSystemPrompt(sanityContext);

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

  res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
  res.end();
});

export default router;
