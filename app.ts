import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import fs from "fs";

require("dotenv").config();

import { connectMongoDb } from "./database/config/db.config";
import { handleChatSocket } from "./socket";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.2:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to attach `io` to `req`
app.use((req: any, res: any, next: any) => {
  req.io = io;
  next();
  /*
        1. How to use
        =======================================================
        =  const { io } = req;                               =
        =  io.emit("cat_get", "<MSG>");                      =
        =  io.to(<SOCKET_ID>).emit("cat_get", "<MSG>");      =
        =======================================================
    */
});

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.2:5173",
      "http://g4grades-api.vercel.app",
      "https://g4grades-api.vercel.app",
    ],
    credentials: true,
  })
);

// Static Files
app.use("/uploads", express.static("uploads"));

// Initial config
connectMongoDb();

// Test Route
app.get("/", (req: any, res: any) => {
  return res.json({
    message: "Prismonic server is active now!",
    success: true,
  });
});

// Function to automatically load all routes
const loadRoutes = async () => {
  const routesPath = path.join(__dirname, "app");

  try {
    // Read the directories in the "app" folder
    const folders = fs.readdirSync(routesPath);

    for (const folder of folders) {
      const folderPath = path.join(routesPath, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        // Read files in the directory
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
          if (file.endsWith(".route.ts")) {
            const filePath = path.join(folderPath, file);

            try {
              const route = await import(filePath); // Import the route file dynamically
              app.use("/api/v1", route.default); // Assuming each route file exports a default router
            } catch (importError) {
              console.error(
                `Failed to import route from file ${filePath}:`,
                importError
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error loading route files:", err);
  }
};

// Initialize the routes
loadRoutes();

// Socket.IO event handling
handleChatSocket(io);

const port = process.env.PORT || 8086;
server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
