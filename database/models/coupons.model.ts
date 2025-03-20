import mongoose, { Schema, Document } from "mongoose";

const CouponsSchema = new Schema(
  {
    code: String,
    discount: Number,
    conditions: {
      maxDiscount: Number,
      isRefer: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", CouponsSchema);

// // Function to create default coupons
// export const createDefaultCoupons = async () => {
//   console.log("Creating coupons...");
//   const defaultCoupons = [
//     {
//       code: "WELCOME50",
//       discount: 50,
//       conditions: { maxDiscount: 20 },
//     },
//     {
//       code: "REFER60",
//       discount: 60,
//       conditions: { maxDiscount: 25 },
//     },
//   ];

//   for (const coupon of defaultCoupons) {
//     const existingCoupon = await Coupon.findOne({ code: coupon.code });
//     if (!existingCoupon) {
//       await Coupon.create(coupon);
//     }
//   }
// };

export default Coupon;
