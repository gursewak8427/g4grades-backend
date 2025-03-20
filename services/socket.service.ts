import connectRedis from "../utils/redisClient";

const redis = connectRedis();

// export const getSocketId = async (io: any, userId: string, data: any) => {
//   const socketId = await redis.get(`user:${userId}`);
//   return socketId;
//   //   if (socketId) {
//   //     io.to(socketId).emit("notification", { data });
//   //   } else {
//   //     console.log(`User ${userId} is offline. Storing notification.`);
//   //     // Store the notification in MongoDB for later retrieval
//   //     // await Notification.create({ userId, data });
//   //   }
// };
