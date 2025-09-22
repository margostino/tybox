import { Router } from "express";
import { getPing } from "../handlers";
import quotesRouter from "./quotes";

const router: Router = Router();

router.get("/ping", getPing);
router.use("/api/quotes", quotesRouter);

export default router;
