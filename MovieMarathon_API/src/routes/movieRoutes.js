import express from "express";
import { MovieController } from "../controllers/movieController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publik (Guest & Pengguna dapat menjelajah & melihat detail)
router.get("/", MovieController.getAll);
router.get("/trending", MovieController.getTrending);
router.get("/:id", MovieController.getById);

// Khusus Admin
router.post("/", requireAuth, requireAdmin, MovieController.create);
router.put("/:id", requireAuth, requireAdmin, MovieController.update);
router.delete("/:id", requireAuth, requireAdmin, MovieController.remove);

export default router;
