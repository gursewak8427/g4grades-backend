import jwt from "jsonwebtoken";
import User from "../../database/models/user.model";
import { randomInt } from "crypto";
import { sendEmail } from "../../services/email.service";
import { ObjectId } from "mongodb";

const generateOtp = (): string => randomInt(100000, 999999).toString();

export const handleAuth = async (email: string, otp?: string) => {
  let user: any = await User.findOne({ email });

  // If no OTP is provided, send a new OTP
  if (!otp) {
    const newOtp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 min

    if (user) {
      user.otp = newOtp;
      user.otpExpires = otpExpires;
    } else {
      user = await User.create({ email, otp: newOtp, otpExpires });
    }

    await user.save();

    // Send OTP via Email
    await sendEmail(email, "Your OTP Code", `Your OTP is: ${newOtp}`);

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
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { success: true, token };
};

export const getUserWithId = async (id: string) => {
  try {
    const user: any = await User.findById(new ObjectId(id)).select("-otp -otpExpires");
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
