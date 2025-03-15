import { Router } from "express";

import { resources } from "../../utils/resources";
import workModel from "../../database/models/work.model";
import { checkLogin } from "../../middlewares";
import { handleNewOffer } from "./work.controller";

const router = Router();

const workResources = resources(workModel);

router.post(
  "/work",
  checkLogin,
  (req: any, res: any, next: any) => {
    req["body"]["createdBy"] = req["user"]["uid"];
    req["body"]["createdAt"] = new Date().toISOString();
    next();
  },
  workResources.create
);
router.get("/work/:id", workResources.single);
router.post(
  "/work/list",
  checkLogin,
  (req: any, res: any, next: any) => {
    if (!req["body"]["filter"]) {
      req["body"]["filter"] = {};
    }
    req["body"]["filter"]["createdBy"] = req["user"]["uid"];
    next();
  },
  workResources.list
);
router.delete("/work/:id", workResources.delete);
router.patch("/work/:id", checkLogin, workResources.update);

router.post("/admin/work/list", checkLogin, workResources.list);
router.post("/admin/work/offer", checkLogin, handleNewOffer);

export default router;
