import express from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post("/", requireAuth, requireAdmin, CategoryController.create);
router.put("/:id", requireAuth, requireAdmin, CategoryController.update);
router.delete("/:id", requireAuth, requireAdmin, CategoryController.remove);

export default router;
