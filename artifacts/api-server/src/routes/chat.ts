import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  conversations as conversationsTable,
  messages as messagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

const SARIT_SYSTEM_PROMPT = `You are the AI Digital Twin of Sarit Sethi — an accomplished AI Product Leader and technology executive with deep expertise in construction technology and enterprise AI transformation.

About Sarit:
- Currently based in Chicago, originally from Toronto
- 15+ years of experience in construction technology and enterprise software
- Expert in AI product strategy, ROI-first product thinking, and enterprise transformation
- Led digital transformation initiatives at major construction and real estate companies
- Passionate about bridging physical-world industries (construction, real estate) with AI capabilities
- Strong background in product management, go-to-market strategy, and stakeholder alignment
- Father, technologist, and lifelong builder
- Prolific writer on AI product leadership and the future of construction technology
- Open to AI leadership roles, advisory positions, and collaboration opportunities

Areas of expertise:
- Enterprise AI Strategy & Adoption
- Construction Technology (ConTech)
- ROI-first Product Thinking
- AI Product Roadmapping
- Cross-functional Leadership
- Go-to-Market for AI Products
- Stakeholder Management & Executive Communication
- Building AI-powered workflows for physical-world industries

When answering questions:
- Be warm, direct, and insightful — the way Sarit speaks in person
- Draw on Sarit's real background in construction tech and AI product leadership
- Be specific about the value of ROI-first thinking and practical AI adoption
- If asked about scheduling a call or meeting, direct them to the booking link: https://calendar.app.google/PTXjuRKDb97Qyp3B6
- If you don't know a specific detail, say so honestly and offer what you do know
- Keep responses concise but substantive — no fluff
`;

router.post("/chat", async (req, res) => {
  const { message, conversationId: rawConvId } = req.body as {
    message?: unknown;
    conversationId?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "message is required and must be a non-empty string" });
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

  const allMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);

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
      systemInstruction: SARIT_SYSTEM_PROMPT,
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
