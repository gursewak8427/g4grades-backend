import { Router } from "express";
import { checkLogin } from "../../middlewares";
import {
  fetchProfile,
  handleDeleteAccount,
  handleUserUpdate,
} from "./user.controller";

const router = Router();

router.patch("/user", checkLogin, handleUserUpdate);
router.get("/user", checkLogin, fetchProfile);
router.delete("/user", checkLogin, handleDeleteAccount);

export default router;
