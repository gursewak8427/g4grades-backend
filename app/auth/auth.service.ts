import jwt from "jsonwebtoken";
import User from "../../database/models/user.model";
import { randomInt } from "crypto";
import { sendEmail } from "../../services/email.service";
import { ObjectId } from "mongodb";
import { showPastDate } from "../../utils/utils";
import Coupon from "../../database/models/coupons.model";
import { getOtpTemplate } from "../../templates/emails/otp";

const generateOtp = (): string => randomInt(100000, 999999).toString();

export const handleAuth = async (email: string, otp?: string) => {
  let user: any = await User.findOne({ email });
  let isNewAccount = false;

  // If isDeleted is true, return error and show alert your account has been delete 2 days ago like this
  if (user?.isDeleted) {
    return {
      success: false,
      message: `Account has been deleted ${showPastDate(
        user?.deletedAt
      )} by user itself.`,
    };
  }

  // If no OTP is provided, send a new OTP
  if (!otp) {
    const newOtp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 min

    if (user) {
      user.otp = newOtp;
      user.otpExpires = otpExpires;
    } else {
      // get couponId of WELCOME60 coupon
      const wlcmCoupon = await Coupon.findOne({ code: "WELCOME50" });
      const coupon = {
        coupon: wlcmCoupon?._id,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        status: "active",
      };
      console.log({ coupon });
      user = await User.create({
        email,
        otp: newOtp,
        otpExpires,
        coupons: wlcmCoupon ? [coupon] : [],
        myReferCode: `REF${Math.random().toString(36).substring(4)}`,
      });
    }

    await user.save();

    // Send OTP via Email
    let template = getOtpTemplate(newOtp);
    sendEmail(email, "Your OTP Code for Verification", template, true);

    console.log(`OTP for ${email}: ${newOtp}`); // Replace with email service
    return { message: "OTP sent to your email", success: true };
  }

  // If OTP is provided, verify it
  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Clear OTP after successful verification
  user.otp = "";
  user.otpExpires = null;

  isNewAccount = user.isNewAccount;

  await user.save();

  // Generate JWT token
  const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { success: true, token, isNewAccount };
};

export const getUserWithId = async (id: string) => {
  try {
    const user: any = await User.findById(new ObjectId(id)).select(
      "-otp -otpExpires"
    );
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
