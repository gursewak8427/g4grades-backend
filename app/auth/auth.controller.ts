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
