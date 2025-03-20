import { Request, Response } from "express";
import * as authService from "./auth.service";

import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../interfaces";

export const loginRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const response = await authService.handleAuth(email, otp);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const profile = async (req: any, res: Response): Promise<void> => {
  try {
    const { uid } = req.user;
    const response = await authService.getUserWithId(uid);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const profileAdmin = async (req: any, res: Response): Promise<void> => {
  try {
    const { uid } = req.user;
    const response: any = await authService.getUserWithId(uid);
    console.log({ response });
    if (response.user.role != "admin") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
