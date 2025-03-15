import { Router } from "express";
import ChatService from "../../services/chat.service";
import { checkLogin } from "../../middlewares";
import multer from "multer";

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },
});

const upload = multer({ storage });

router.get(
  "/chats/:chatId/messages",
  checkLogin,
  async (req: any, res: any) => {
    try {
      const messages = await ChatService.getMessages(req.params.chatId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/chats/:chatId/message",
  checkLogin,
  upload.fields([{ name: "files", maxCount: 5 }]), // Assuming the files are sent with the field name 'files'
  async (req: any, res: any) => {
    try {
      const { content, messageType, timestamp } = req.body;
      console.log({ files: req.files });
      const files = req.files?.files || []; // Files uploaded by multer
      const io = req["io"];
      console.log(req.body);
      const message = await ChatService.sendMessage(
        req.params.chatId,
        req?.user?.uid,
        content,
        messageType,
        timestamp,
        files,
        io
      );
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.patch(
  "/chats/:chatId/delivered",
  checkLogin,
  async (req: any, res: any) => {
    try {
      const io = req["io"];
      await ChatService.markDelivered(req.params.chatId, io);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.patch(
  "/chats/:chatId/seen/:userId",
  checkLogin,
  async (req: any, res: any) => {
    try {
      const io = req["io"];
      await ChatService.markSeen(req.params.chatId, req.params.userId, io);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
