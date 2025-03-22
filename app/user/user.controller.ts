import Coupon from "../../database/models/coupons.model";
import userModel from "../../database/models/user.model";
import { sendEmail } from "../../services/email.service";
import { getCouponReceivedTemplate } from "../../templates/emails/refer";

export const handleUserUpdate = async (req: any, res: any) => {
  const body = req.body;
  const { uid } = req.user;

  await userModel.findByIdAndUpdate(uid, { ...body });

  if (body["referCode"]) {
    const newUser = await userModel.findOne({ _id: uid });
    const user: any = await userModel.findOne({
      myReferCode: body["referCode"],
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Refer code not found" });
    }

    // get refer coupon
    const coupon = await Coupon.findOne({ "conditions.isRefer": true });
    console.log({ referCoupon: coupon });
    if (coupon) {
      await userModel.findByIdAndUpdate;
      user.coupons.push({
        coupon: coupon._id,
        status: "active",
        validTill: new Date(new Date().setDate(new Date().getDate() + 30)),
      });

      await user.save();

      // send Email
      const template = getCouponReceivedTemplate(
        newUser?.email?.toString() || ""
      );
      sendEmail(user.email, `You got refer coupon | G4Grades`, template, true);
    }
  }

  return res.json({
    success: true,
    message: "User updated",
  });
};

export const fetchProfile = async (req: any, res: any) => {
  const { uid } = req.user;

  const response = await userModel.findById(uid);

  return res.json({
    success: true,
    message: "User updated",
    details: {
      user: response,
    },
  });
};

export const handleDeleteAccount = async (req: any, res: any) => {
  const { uid } = req.user;

  await userModel.findByIdAndUpdate(uid, {
    isDeleted: true,
    deletedAt: new Date(),
  });

  return res.json({
    success: true,
    message: "User deleted",
  });
};
