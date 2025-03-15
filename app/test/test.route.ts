import { Router } from "express";
import * as testControllers from "./test.controller";

const router = Router();

router.get("/test", testControllers.test);

export default router;
