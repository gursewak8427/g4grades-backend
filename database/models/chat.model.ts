import mongoose, { Schema, Document } from "mongoose";

export interface IFile {
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  messageType:
    | "text"
    | "offer"
    | "payment"
    | "file"
    | "offer-accepted"
    | "offer-rejected"
    | "offer-payment"
    | "offer-payment-confirm"
    | "work-status";
  status: "SENT" | "DELIVERED" | "SEEN";
  files: IFile[];
}

export interface IChat extends Document {
  workId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  status: "OPEN" | "CLOSED";
  unseenUser: number;
  unseenAdmin: number;
}

const FileSchema = new Schema<IFile>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
});

const MessageSchema = new Schema<IMessage>({
  _id: { type: Schema.Types.ObjectId, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  content: { type: String },
  timestamp: { type: Date, default: Date.now },
  messageType: {
    type: String,
    enum: [
      "text",
      "offer",
      "payment",
      "file",
      "offer-accepted",
      "offer-rejected",
      "offer-payment",
      "offer-payment-confirm",
      "work-status",
    ],
    default: "text",
  },
  status: {
    type: String,
    enum: ["SENT", "DELIVERED", "SEEN"],
    default: "SENT",
  },
  files: [FileSchema],
});

const ChatSchema = new Schema<IChat>({
  workId: { type: Schema.Types.ObjectId, ref: "Work", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  adminId: { type: Schema.Types.ObjectId, ref: "User" },
  messages: [MessageSchema],
  status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
  unseenUser: {
    type: Number,
    default: 0,
  },
  unseenAdmin: {
    type: Number,
    default: 0,
  },
});

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
export const Message = mongoose.model<IMessage>("Message", MessageSchema);
