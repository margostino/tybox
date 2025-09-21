import { Router } from "express";
import { getPing } from "../handlers";

const router: Router = Router();

router.get("/ping", getPing);

export default router;
