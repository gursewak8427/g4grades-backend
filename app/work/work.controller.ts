import mongoose from "mongoose";
import workModel from "../../database/models/work.model";
import { Message } from "../../database/models/chat.model";

export const handleNewWork = async (req: any, res: any) => {
  try {
    const body = req.body;
    console.log({ body });
    let newWork = await workModel.create(body);

    let workDetails = await workModel
      .findById(newWork._id)
      .populate("createdBy");

    const io = req["io"];
    io.emit("new_work", {
      work: workDetails,
    });

    let adminDetails = await userModel
      .findOne({ role: "admin" })
      .sort({ createdAt: -1 });

    let otherUserId: any = adminDetails?._id;

    if (otherUserId) {
      // Simple Outer Message Event
      const otherUserSocketId = await redis.get(`user:${otherUserId}`);

      if (otherUserSocketId) {
        let userDetails: any = await userModel
          .findById(workDetails?.createdBy)
          .lean();

        // Notification send
        sendNotification(io, otherUserId, {
          message: `New Work Received ${workDetails?.title}`,
          description: `${userDetails?.email}`,
          type: "info",
          data: {
            type: "new_work",
            details: {
              workDetails,
              userDetails,
            },
          },
        });
      } else {
        let otherUser: any = await userModel.findById(otherUserId);
        let userDetails: any = await userModel
          .findById(workDetails?.createdBy)
          .lean();
        await sendEmail(
          otherUser.email,
          `New Work Received ${workDetails?.title} | G4Grades`,
          `You have a new work - ${workDetails?.title} \nUser - ${userDetails?.email}`
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Work created successfully",
      details: workDetails,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

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

    let deepWorkDetails: any = await workModel
      .findById(workId)
      .populate("createdBy offers.appliedCoupon.coupon");
    console.log({ deepWorkDetails });

    // Emit WebSocket event for real-time updates
    io.to(workId).emit("work_update", {
      type: "offer_update",
      offer: deepWorkDetails.offers[offerIndex],
    });

<<<<<<< HEAD
    let otherUserId =
      uid == workItem?.createdBy ? chatItem?.adminId : chatItem?.userId;

    let msg = "";
    let type = "info"; // info, success, warning, error
    if (data["paymentStatus"] == "PAID") {
      msg = "Admin Confirm the payment";
      type = "success";

      await workModel.updateOne(
        { _id: new mongoose.Types.ObjectId(workId) },
        {
          paymentStatus: "PAID",
        }
      );

      // change user's coupon state to used
      let appliedCouponId =
        deepWorkDetails?.offers[offerIndex]["appliedCoupon"]["coupon"]["_id"];
      console.log({
        activeOffer: deepWorkDetails?.offers[offerIndex],
        appliedCouponId,
      });
      let user: any = await userModel
        .findById(deepWorkDetails?.createdBy)
        .lean();
      let coupon = user.coupons.map((coupon: any) =>
        coupon.coupon?.toString() === appliedCouponId?.toString()
          ? { ...coupon, status: "used" }
          : coupon
      );
      console.log({ user, coupon });
      await userModel.updateOne(
        { _id: new mongoose.Types.ObjectId(deepWorkDetails?.createdBy) },
        {
          coupons: coupon,
        }
      );
    } else if (data["paymentStatus"] == "PROCESSING") {
      msg = "User pay the fees";
      type = "success";

      await workModel.updateOne(
        { _id: new mongoose.Types.ObjectId(workId) },
        {
          paymentStatus: "PROCESSING",
        }
      );
    } else if (data["status"] == "ACCEPTED") {
      msg = "User accept the offer";
      type = "success";

      // Update work details also
      console.log("Updating fees", {
        workId,
        fees: workItem.offers[offerIndex]["price"],
      });
      await workModel.updateOne(
        { _id: new mongoose.Types.ObjectId(workId) },
        {
          fees: workItem.offers[offerIndex]["price"],
        }
      );
    } else if (data["status"] == "REJECTED") {
      msg = "User reject the offer";
      type = "error";
    }

    const activeChatId = await redis.get(`activeChat:${otherUserId}`);
    console.log({ activeChatId, workId });
    if (activeChatId != workId) {
      const sender = await userModel.findById(uid);
      let chat: any = await Chat.findOne({ workId });
      if (sender?.role === "user") {
        chat.unseenAdmin += 1;
      } else {
        chat.unseenUser += 1;
      }
      await chat.save();

      const otherUserSocketId = await redis.get(`user:${otherUserId}`);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("new_message_outer", message);

        sendNotification(io, otherUserId, {
          message: `${msg}`,
          description: `Offer #${workItem.offers[offerIndex]["offerId"]} in ${workItem?.title}`,
          type,
          data: {
            type: "offer_update",
          },
        });
      } else {
        console.log("Other user is not online");
        let otherUser: any = await userModel.findById(otherUserId);
        console.log({ otherUser });
        await sendEmail(
          otherUser.email,
          `${msg} | G4Grades`,
          `You have an update in ${workItem?.title}`
        );
      }
    }

=======
>>>>>>> parent of f03b126 (noti done)
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
