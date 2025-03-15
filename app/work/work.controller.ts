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

    let workDetails: any = await workModel.findById(workId);

    let newOffer = {
      offerId: `${workDetails?.offers?.length + 100 + 1}`,
      _id: new mongoose.Types.ObjectId(),
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

    const message: any = {
      _id: new mongoose.Types.ObjectId(),
      chatId: workId,
      senderId: uid,
      content: newOffer?.offerId,
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

export const handleUpdateOffer = async (req: any, res: any) => {
  try {
    const { workId, offerId, data } = req.body;
    const io = req["io"];
    const { uid } = req.user;

    if (!workId || !offerId || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: workId, offerId, or update data",
      });
    }

    // Find the work item
    const workItem: any = await workModel.findById(workId);
    if (!workItem) {
      return res.status(404).json({
        success: false,
        message: "Work item not found",
      });
    }

    // Find the index of the offer inside the offers array
    const offerIndex = workItem.offers.findIndex(
      (offer: any) => offer._id.toString() === offerId
    );
    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Update only provided fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        workItem.offers[offerIndex][key] = data[key];
      }
    });

    // Save the updated document
    await workItem.save();

    const message: any = {
      _id: new mongoose.Types.ObjectId(),
      chatId: workId,
      senderId: uid,
      content: workItem.offers[offerIndex]["offerId"],
      messageType:
        data["paymentStatus"] == "PROCESSING"
          ? "offer-payment"
          : data["paymentStatus"] == "PAID"
          ? "offer-payment-confirm"
          : data["status"] == "ACCEPTED"
          ? "offer-accepted"
          : "offer-rejected",
      timestamp: new Date()?.toUTCString(),
      status: "SENT",
    };

    // Emit the message via socket first
    io.to(workId).emit("new_message", message);

    // Save message
    const savedMessage = await Message.create(message);

    // Emit WebSocket event for real-time updates
    io.to(workId).emit("work_update", {
      type: "offer_update",
      offer: workItem.offers[offerIndex],
    });

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer: workItem.offers[offerIndex],
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const handleAdminUpdateWork = async (req: any, res: any) => {
  try {
    const { workId, data } = req.body;
    const io = req["io"];
    const { uid } = req.user;

    if (!workId || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: workId or update data",
      });
    }

    // Find the work item
    const workItem: any = await workModel.findById(workId);
    if (!workItem) {
      return res.status(404).json({
        success: false,
        message: "Work item not found",
      });
    }

    // Update only provided fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        workItem[key] = data[key];
      }
    });

    // Save the updated document
    await workItem.save();

    const message: any = {
      _id: new mongoose.Types.ObjectId(),
      chatId: workId,
      senderId: uid,
      content: data["status"] ? data["status"] : "",
      messageType: data["status"] ? "work-status" : "",
      timestamp: new Date()?.toUTCString(),
      status: "SENT",
    };

    // Emit the message via socket first
    io.to(workId).emit("new_message", message);

    // Save message
    const savedMessage = await Message.create(message);

    // Emit WebSocket event for real-time updates
    io.to(workId).emit("work_update", {
      type: "work-status",
      work: workItem,
    });

    return res.status(200).json({
      success: true,
      message: "Work updated successfully",
      work: workItem,
    });
  } catch (error) {
    console.error("Error updating work:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
