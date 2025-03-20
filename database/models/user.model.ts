import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  otp?: string;
  otpExpires?: Date;
  role: "admin" | "user";
  online: boolean;
  socketId?: string; // Store the socket ID for direct messaging
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  online: { type: Boolean, default: false },
  socketId: { type: String, default: null },
});

export default mongoose.model<IUser>("User", UserSchema);
