import mongoose, { Schema, Document } from "mongoose";
import { Request, Response } from "express";
import Coupon from "../../database/models/coupons.model";
import userModel from "../../database/models/user.model";

export const handleApplyCoupon = async (req: any, res: any) => {
  try {
    const { uid } = req.user;
    const { couponCode } = req.body;

    // 1. Get coupon with coupon code
    const coupon: any = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    // 2. Check if coupon is also inside user's coupon list
    const user: any = await userModel.findById(uid);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userCoupon: any = user.coupons.find(
      (c: any) => c.coupon.toString() === coupon._id.toString()
    );
    if (!userCoupon) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon not available for you" });
    }

    // 3. Check if user has coupon with active status
    if (userCoupon.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Coupon is already used or expired" });
    }

    // 4. If yes, send discount to the coupon
    const response = {
      success: true,
      message: "Coupon applied",
      discount: coupon.discount,
      couponId: coupon._id,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};