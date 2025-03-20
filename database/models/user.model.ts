import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  bio: String;
  email: string;
  fullName: string;
  phone: string;
  otp?: string;
  otpExpires?: Date;
  role: "admin" | "user";
  online: boolean;
  socketId?: string; // Store the socket ID for direct messaging
  isDeleted: Boolean;
  deletedAt: Date;
  coupons: {
    code: string;
    discount: number;
    validTill: Date;
    status: "active" | "expired" | "used";
  };
  isNewAccount: boolean;
  referCode: string;
  myReferCode: String;
}

const UserSchema = new Schema<IUser>(
  {
    bio: String,
    fullName: String,
    phone: String,
    email: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    online: { type: Boolean, default: false },
    socketId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    isNewAccount: { type: Boolean, default: true },
    myReferCode: String,
    referCode: { type: String, default: null },
    coupons: [
      {
        coupon: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Coupon",
        },
        validTill: Date,
        status: {
          type: String,
          enum: ["active", "expired", "used"],
          default: "active",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
