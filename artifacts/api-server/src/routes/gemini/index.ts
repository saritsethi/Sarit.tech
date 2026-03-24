import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  CreateGeminiConversationBody,
  SendGeminiMessageBody,
  GetGeminiConversationParams,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  SendGeminiMessageParams,
} from "@workspace/api-zod";

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

router.get("/conversations", async (req, res) => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(conversationsTable.createdAt);
  res.json(conversations);
});

router.post("/conversations", async (req, res) => {
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [conversation] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
    .returning();
  res.status(201).json(conversation);
});

router.get("/conversations/:id", async (req, res) => {
  const params = GetGeminiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const conversation = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .limit(1);
  if (!conversation[0]) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json({ ...conversation[0], messages });
});

router.delete("/conversations/:id", async (req, res) => {
  const params = DeleteGeminiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();
  if (!deleted[0]) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.status(204).send();
});

router.get("/conversations/:id/messages", async (req, res) => {
  const params = ListGeminiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const params = SendGeminiMessageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = SendGeminiMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const conversation = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .limit(1);

  if (!conversation[0]) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId: params.data.id,
    role: "user",
    content: body.data.content,
  });

  const allMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: allMessages.map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
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
    conversationId: params.data.id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
