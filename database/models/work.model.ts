import mongoose, { Schema } from "mongoose";

export interface IWork extends Document {
  title: string;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId; // User who requested the work
  createdAt: Date;
  fees: number;
  currency: string;
  paymentStatus: "PAID" | "PENDING" | "PROCESSING";
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  offers: [
    {
      price: number;
      dueDateTime: Date;
      status: "PENDING" | "ACCEPTED" | "REJECTED";
      paymentStatus: "PENDING" | "PROCESSING" | "PAID";
      appliedCoupon: {
        status: boolean;
        coupon: mongoose.Types.ObjectId;
        discount: Number;
      };
    }
  ];
}

const WorkSchema = new Schema<IWork>({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Linked to User
  createdAt: { type: Date, required: true },
  fees: { type: Number, default: 0 },
  currency: { type: String, default: "CAD" },
  paymentStatus: {
    type: String,
    enum: ["PAID", "PENDING", "PROCESSING"],
    default: "PENDING",
  },
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "DONE"],
    default: "PENDING",
  },
  offers: [
    {
      offerId: String,
      price: Number,
      dueDateTime: Date,
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING",
      },
      paymentStatus: {
        type: String,
        enum: ["PENDING", "PROCESSING", "PAID"],
        default: "PENDING",
      },
      appliedCoupon: {
        status: Boolean,
        coupon: {
          type: Schema.Types.ObjectId,
          ref: "Coupon",
        },
        discount: Number,
      },
    },
  ],
});

export default mongoose.model<IWork>("Work", WorkSchema);
