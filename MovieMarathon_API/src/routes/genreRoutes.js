import express from "express";
import { GenreController } from "../controllers/genreController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", GenreController.getAll);
router.get("/:id", GenreController.getById);

// Khusus Admin
router.post("/", requireAuth, requireAdmin, GenreController.create);
router.put("/:id", requireAuth, requireAdmin, GenreController.update);
router.delete("/:id", requireAuth, requireAdmin, GenreController.remove);

export default router;
