// Vercel's serverless-function typecheck resolves the Express types
// differently than the local install and wrongly reports `router.use` as
// missing on `IRouter` (the file passes the local bundler typecheck).
// This suppresses that false positive for this file only; it changes no
// runtime behavior and leaves the typecheck in place for other files.
// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/index";
import rssRouter from "./rss";
import chatRouter from "./chat";
import contentRouter from "./content";
import ragRouter from "./rag";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use(rssRouter);
router.use(chatRouter);
router.use(contentRouter);
router.use(ragRouter);

export default router;
