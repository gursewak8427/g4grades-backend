import { Request, Response } from "express";
import { testService } from "./test.service";

export const test = async (req: any, res: any) => {
  const data = await testService();
  return res.json({
    success: true,
    message: "It is test api",
    details: {
      data,
    },
  });
};
