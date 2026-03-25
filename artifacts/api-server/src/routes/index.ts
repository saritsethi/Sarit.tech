import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/index";
import rssRouter from "./rss";
import chatRouter from "./chat";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use(rssRouter);
router.use(chatRouter);
router.use(contentRouter);

export default router;
