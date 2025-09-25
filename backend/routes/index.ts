import { Router } from "express";
import { getPing } from "../handlers";
import authRouter from "./auth";
import feedRouter from "./feed";
import quotesRouter from "./quotes";

const router: Router = Router();

router.get("/ping", getPing);
router.use("/v1/quotes", quotesRouter);
router.use("/v1/feed", feedRouter);
router.use("/v1/auth", authRouter);

export default router;
