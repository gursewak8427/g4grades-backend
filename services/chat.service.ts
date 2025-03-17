import { Chat, Message, IChat, IMessage } from "../database/models/chat.model";
import mongoose from "mongoose";
import User from "../database/models/user.model";
import { sendNotification } from "./notification.service";
import workModel from "../database/models/work.model";
import connectRedis from "../utils/redisClient";
import { sendEmail } from "./email.service";
import userModel from "../database/models/user.model";

const redis = connectRedis();
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

      const workDetails = await workModel.findById(workId);

      let chat: any = await Chat.findOne({ workId: workId });
      if (!chat) {
        chat = await Chat.create({
          messages: [],
          status: "OPEN",
          workId: workId,
          userId: workDetails?.createdBy,
        });
      }

      let otherUserId = chat?.userId == senderId ? chat?.adminId : chat?.userId;

      // console.log({ chat });
      // Auto-assign Admin
      const sender = await User.findById(senderId);
      if (sender?.role === "admin" && !chat.adminId) {
        chat.adminId = new mongoose.Types.ObjectId(senderId);
      }
      if (sender?.role === "user" && !chat.userId) {
        chat.userId = new mongoose.Types.ObjectId(senderId);
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

      console.log({ otherUserId });

      // Save the message in the database
      const savedMessage = await Message.create(message);

      console.log({ savedMessage });

      chat.messages.push(savedMessage);
      const activeChatId = await redis.get(`activeChat:${otherUserId}`);
      if (activeChatId != workId) {
        if (sender?.role === "user") {
          chat.unseenAdmin += 1;
        } else {
          chat.unseenUser += 1;
        }
      }

      await chat.save();

      // Send Notification
      if (otherUserId) {
        if (activeChatId != workId) {
          // Simple Outer Message Event
          const otherUserSocketId = await redis.get(`user:${otherUserId}`);

          if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("new_message_outer", message);

            // Notification send
            sendNotification(io, otherUserId, {
              message: `New Message in ${workDetails?.title}`,
              description: `${message?.content}`,
              type: "info",
              data: {
                type: "new_message",
                details: message,
              },
            });
          } else {
            console.log("Other user is not online");
            let otherUser: any = await userModel.findById(otherUserId);
            console.log({ otherUser });
            await sendEmail(
              otherUser.email,
              `New Message in ${workDetails?.title} | G4Grades`,
              `You have an unreed message - ${message?.content} \nWork - ${workDetails?.title}`
            );
          }
        }
      }

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
   * Reset Unseen to 0
   */
  async resetUnseen(workId: string, role: string) {
    console.log({ workId, role });
    if (role == "user")
      await Chat.updateOne({ workId: workId }, { $set: { unseenUser: 0 } });
    if (role == "admin")
      await Chat.updateOne({ workId: workId }, { $set: { unseenAdmin: 0 } });

    return;
  }

  /**
   * Fetch Chat Messages
   */
  async getMessages(chatId: string) {
    return Message.find({ chatId }).sort({ timestamp: 1 });
  }
}

export default new ChatService();
