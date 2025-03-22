import { Chat, Message, IChat, IMessage } from "../database/models/chat.model";
import mongoose from "mongoose";
import User from "../database/models/user.model";
import { sendNotification } from "./notification.service";
import workModel from "../database/models/work.model";
import { sendEmail } from "./email.service";
import userModel from "../database/models/user.model";
import connectRedis from "../utils/redisClient";
import { getNewMessageTemplate } from "../templates/emails/message";

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

  sendNoti = async ({
    otherUserId,
    workDetails,
    workId,
    activeChatId,
    message,
    io,
    isNew,
  }: any) => {
    console.log("Notification send initiate.............");
    // Send Notification
    try {
      if (otherUserId) {
        const otherUserSocketId = await redis.get(`user:${otherUserId}`);
        console.log({ otherUserSocketId });
        if (otherUserSocketId)
          io.to(otherUserSocketId).emit("new_message_outer", message);
        if (activeChatId != workId) {
          if (otherUserSocketId) {
            // Notification send
            sendNotification(io, otherUserId, {
              message: `New Message in ${workDetails?.title}`,
              description: `${
                message?.content ||
                `${message?.files?.length} ${
                  message?.files?.length > 1 ? "files" : "file"
                }`
              }`,
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
            if (isNew) {
              let userDetails: any = await userModel
                .findById(workDetails?.createdBy)
                .lean();
              await sendEmail(
                otherUser.email,
                `New Work Received ${workDetails?.title} | G4Grades`,
                `You have a new work - ${workDetails?.title} \nUser - ${userDetails?.email}`
              );
            }

            let template = getNewMessageTemplate(
              workDetails?.title,
              message?.content,
              message?.files?.length
            );
            await sendEmail(
              otherUser.email,
              `New Message in ${workDetails?.title} | G4Grades`,
              template,
              true
            );
          }
        } else {
          console.log(`User is online in chat ${workId}`);
        }
      }
      console.log("Notification send.............");
    } catch (error) {
      console.log("Notification send error.............");
    } finally {
      console.log("Notification send finally.............");
    }
  };

  async sendMessage(
    workId: string,
    senderId: string,
    content: string,
    messageType: "text" | "offer" | "payment",
    timestamp: any,
    files: any,
    io: any
  ) {
    const startTime = Date.now();
    try {
      console.log("Processing message...");

      // **Try to fetch workDetails & chat from cache**
      let [workDetails, chatData] = await Promise.all([
        redis
          .get(`work:${workId}`)
          .then((data) => (data ? JSON.parse(data) : null)),
        redis
          .get(`chat:${workId}`)
          .then((data) => (data ? JSON.parse(data) : null)),
      ]);

      console.log("1 - Cache Check Done");

      if (!workDetails) {
        workDetails = await workModel.findById(workId);
        redis.setex(`work:${workId}`, 300, JSON.stringify(workDetails)); // Cache for 5 mins
      }

      let isNew = false;
      if (!chatData) {
        isNew = true;
        let adminDetails: any = await redis.get("admin:last");

        if (!adminDetails) {
          adminDetails = await userModel
            .findOne({ role: "admin" })
            .sort({ createdAt: -1 })
            .lean();
          redis.setex("admin:last", 600, JSON.stringify(adminDetails)); // Cache for 10 mins
        } else {
          adminDetails = JSON.parse(adminDetails);
        }

        chatData = await Chat.create({
          messages: [],
          status: "OPEN",
          workId,
          userId: workDetails?.createdBy,
          adminId: adminDetails?._id,
        });

        redis.setex(`chat:${workId}`, 300, JSON.stringify(chatData)); // Cache chat for 5 mins
      }

      const otherUserId =
        chatData?.userId == senderId ? chatData?.adminId : chatData?.userId;

      // Auto-assign missing roles
      const sender = await User.findById(senderId).lean();
      if (sender?.role === "admin" && !chatData.adminId)
        chatData.adminId = senderId;
      if (sender?.role === "user" && !chatData.userId)
        chatData.userId = senderId;

      // Construct message object
      const messageId = new mongoose.Types.ObjectId();
      const message = {
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
          url: file.filename,
        })),
      };

      // Emit message via socket
      io.to(workId).emit("new_message", message);

      // Save message asynchronously
      const [savedMessage, activeChatId] = await Promise.all([
        Message.create(message),
        redis.get(`activeChat:${otherUserId}`),
      ]);

      chatData.messages.push(savedMessage);
      if (activeChatId !== workId) {
        sender?.role === "user"
          ? chatData.unseenAdmin++
          : chatData.unseenUser++;
      }

      // Save chat update in background
      Chat.updateOne({ _id: chatData?._id }, chatData).then(() =>
        redis.setex(`chat:${workId}`, 300, JSON.stringify(chatData))
      ); // Update cache

      // Send notification asynchronously
      setImmediate(() =>
        this.sendNoti({
          otherUserId,
          workDetails,
          workId,
          activeChatId,
          message,
          io,
          isNew,
        }).catch((error) => console.error("Notification send error:", error))
      );

      console.log("Message processed & saved.");
      return savedMessage;
    } catch (error) {
      console.error("sendMessage error:", error);
    } finally {
      const endTime = Date.now();
      console.log(`sendMessage execution time: ${endTime - startTime} ms`);
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
