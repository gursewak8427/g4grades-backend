import connectRedis from "./utils/redisClient"; // Import Redis client

const redis = connectRedis();

export const handleChatSocket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("register", async (userId: string) => {
      await redis.set(`user:${userId}`, socket.id);
      console.log(`User ${userId} mapped to Socket ID: ${socket.id}`);
    });

    socket.on("join_work_chat", async ({ workId, userId }: any) => {
      console.log(
        `User joined chat with ${JSON.stringify({ workId, userId })}`
      );
      socket.join(workId);
      await redis.set(`activeChat:${userId}`, workId);
    });

    socket.on("leave_work_chat", async ({ workId, userId }: any) => {
      console.log(`User Leave chat with ${JSON.stringify({ workId, userId })}`);
      socket.join(workId);
      await redis.set(`activeChat:${userId}`, "");
    });

    socket.on("typing", ({ chatId, userId }: any) => {
      socket.to(chatId).emit("user_typing", { chatId, userId });
    });

    socket.on("disconnect", async () => {
      console.log("User Disconnected");
      const keys = await redis.keys("user:*");
      for (let key of keys) {
        const storedSocketId = await redis.get(key);
        if (storedSocketId === socket.id) {
          await redis.del(key);
          console.log(
            `User ${key.split(":")[1]} disconnected and removed from Redis`
          );
          break;
        }
      }
    });
  });
};

/*
  Frontend -> https://chatgpt.com/c/67c8d093-4890-800f-9291-a0c6f7603f0a
*/
