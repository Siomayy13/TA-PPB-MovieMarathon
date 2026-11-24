import express from "express";
import { MovieController } from "../controllers/movieController.js";

const router = express.Router();

router.get("/", MovieController.getAll);
router.get("/:id", MovieController.getById);
router.post("/", MovieController.create);
router.put("/:id", MovieController.update);
router.delete("/:id", MovieController.remove);

export default router;
