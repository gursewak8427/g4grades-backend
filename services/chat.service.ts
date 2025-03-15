import { Chat, Message, IChat, IMessage } from "../database/models/chat.model";
import mongoose from "mongoose";
import User from "../database/models/user.model";

class ChatService {
  /**
   * Get or Create a Chat
   */
  async getOrCreateChat(workId: string, userId: string): Promise<IChat> {
    let chat = await Chat.findOne({ workId, userId }).populate("messages");

    if (!chat) {
      chat = await Chat.create({
        workId,
        userId,
        status: "OPEN",
        messages: [],
      });
    }

    return chat;
  }

  /**
   * Send Message (Real-time & Admin Assignment)
   */
  async sendMessage(
    workId: string,
    senderId: string,
    content: string,
    messageType: "text" | "offer" | "payment",
    timestamp: any,
    files: any,
    io: any
  ) {
    try {
      console.log({ workId, senderId, content, messageType, files });

      let chat: any = await Chat.findOne({ workId: workId });
      if (!chat) {
        chat = await Chat.create({
          messages: [],
          status: "OPEN",
          workId: workId,
          userId: senderId,
        });
      }
      // console.log({ chat });
      // Auto-assign Admin
      const sender = await User.findById(senderId);
      if (sender?.role === "admin" && !chat.adminId) {
        chat.adminId = new mongoose.Types.ObjectId(senderId);
      }

      const messageId = new mongoose.Types.ObjectId();
      const message: any = {
        _id: messageId,
        chatId: workId,
        senderId,
        content,
        messageType,
        timestamp: new Date(timestamp)?.toUTCString(),
        status: "SENT",
        files: files.map((file: any) => ({
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: file.filename, // Assuming the file object has a URL property
        })),
      };

      console.log({ message });

      // Emit the message via socket first
      io.to(workId).emit("new_message", message);

      console.log("IM here", message);

      // Save the message in the database
      const savedMessage = await Message.create(message);

      console.log({ savedMessage });

      chat.messages.push(savedMessage);
      await chat.save();

      return savedMessage;
    } catch (error) {
      console.log({ error });
    }
  }
  /**
   * Mark Messages as Delivered
   */
  async markDelivered(chatId: string, io: any) {
    await Message.updateMany(
      { chatId, status: "SENT" },
      { $set: { status: "DELIVERED" } }
    );
    io.to(chatId).emit("message_delivered", { chatId });
  }

  /**
   * Mark Messages as Seen
   */
  async markSeen(chatId: string, userId: string, io: any) {
    await Message.updateMany(
      { chatId, senderId: { $ne: userId } },
      { $set: { status: "SEEN" } }
    );
    io.to(chatId).emit("message_seen", { chatId, userId });
  }

  /**
   * Fetch Chat Messages
   */
  async getMessages(chatId: string) {
    return Message.find({ chatId }).sort({ timestamp: 1 });
  }
}

export default new ChatService();
