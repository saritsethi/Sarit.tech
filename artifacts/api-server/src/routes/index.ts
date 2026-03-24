import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/index";
import rssRouter from "./rss";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use(rssRouter);
router.use(chatRouter);

export default router;
