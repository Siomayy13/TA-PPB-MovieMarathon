import express from "express";
import { MarathonController } from "../controllers/marathonController.js";

const router = express.Router();

router.get("/", MarathonController.getAll);
router.get("/:id", MarathonController.getById);
router.post("/", MarathonController.create);
router.put("/:id", MarathonController.update);
router.delete("/:id", MarathonController.remove);

export default router;
