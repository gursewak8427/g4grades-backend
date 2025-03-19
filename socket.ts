export const handleChatSocket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_work_chat", (workId: any) => {
      socket.join(workId);
      console.log(`User joined chat with workId: ${workId}`);
    });

    socket.on("typing", ({ chatId, userId }: any) => {
      socket.to(chatId).emit("user_typing", { chatId, userId });
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });
};



/*
  Frontend -> https://chatgpt.com/c/67c8d093-4890-800f-9291-a0c6f7603f0a
*/