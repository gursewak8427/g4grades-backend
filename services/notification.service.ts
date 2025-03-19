import connectRedis from "../utils/redisClient";

const redis = connectRedis();

export const sendNotification = async (io: any, userId: string, data: any) => {
  const socketId = await redis.get(`user:${userId}`);

  console.log(`sendNotification ${userId} ===> ${JSON.stringify(data)}`);

  if (socketId) {
    io.to(socketId).emit("notification", data);
  } else {
    console.log(`User ${userId} is offline. Storing notification.`);
    // await Notification.create({ userId, message, isRead: false });
  }
};
