import { Router } from "express";
import * as authControllers from "./auth.controller";
import { checkLogin } from "../../middlewares";

const router = Router();

router.post("/auth", authControllers.loginRegister);
router.get("/auth/me", checkLogin, authControllers.profile);
router.get("/auth/admin/me", checkLogin, authControllers.profileAdmin);

export default router;
