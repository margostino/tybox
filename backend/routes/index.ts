import { Router } from "express";
import { getPing } from "../handlers";
import feedRouter from "./feed";
import quotesRouter from "./quotes";

const router: Router = Router();

router.get("/ping", getPing);
router.use("/v1/quotes", quotesRouter);
router.use("/v1/feed", feedRouter);

export default router;
