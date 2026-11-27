import express from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publik: baca ulasan
router.get("/", ReviewController.getAll);
router.get("/movie/:movieId", ReviewController.getByMovieId);

// Wajib Login untuk menulis atau menghapus ulasan
router.post("/", requireAuth, ReviewController.create);
router.delete("/:id", requireAuth, ReviewController.remove);

export default router;
