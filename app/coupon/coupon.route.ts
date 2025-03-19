import { Router } from "express";
import Coupon from "../../database/models/coupons.model";
import { resources } from "../../utils/resources";
import { checkLogin } from "../../middlewares";
import { handleApplyCoupon } from "./coupon.controller";

const router = Router();

const couponResources = resources(Coupon);
router.post("/coupon/list", couponResources.list);
router.post("/coupon/apply", checkLogin, handleApplyCoupon);

export default router;
