import express from "express";
import { EpisodeController } from "../controllers/episodeController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publik (Guest & User dapat melihat daftar episode dan preview video)
router.get("/movie/:movieId", EpisodeController.getByMovieId);
router.get("/:id", EpisodeController.getById);

// Khusus Admin untuk mengelola episode
router.post("/", requireAuth, requireAdmin, EpisodeController.create);
router.put("/:id", requireAuth, requireAdmin, EpisodeController.update);
router.delete("/:id", requireAuth, requireAdmin, EpisodeController.remove);

export default router;
