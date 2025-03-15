import mongoose from "mongoose";
import workModel from "../../database/models/work.model";
import { Message } from "../../database/models/chat.model";

export const handleNewOffer = async (req: any, res: any) => {
  try {
    const { workId, price, dueDateTime } = req.body;
    const io = req["io"];
    const { uid } = req.user;

    // Validate input
    if (!workId || !price || !dueDateTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: workId, price, or dueDateTime",
      });
    }

    let newOffer = {
      price: parseFloat(price),
      dueDateTime: new Date(dueDateTime).toISOString(), // Ensure UTC format
      status: "PENDING",
      paymentStatus: "PENDING",
    };

    console.log("Sending work_update event");
    io.to(workId).emit("work_update", {
      type: "offer",
      offer: newOffer,
    });

    const messageId = new mongoose.Types.ObjectId();
    const message: any = {
      _id: messageId,
      chatId: workId,
      senderId: uid,
      messageType: "offer",
      timestamp: new Date()?.toUTCString(),
      status: "SENT",
    };

    // Emit the message via socket first
    io.to(workId).emit("new_message", message);

    // Save message
    const savedMessage = await Message.create(message);

    const updateResult = await workModel.updateOne(
      { _id: workId },
      {
        $push: {
          offers: {
            $each: [newOffer], // Insert new offer
            $position: 0, // Push to the beginning instead of the end
          },
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Work item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
