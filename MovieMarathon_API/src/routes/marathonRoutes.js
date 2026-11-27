import express from "express";
import { MarathonController } from "../controllers/marathonController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publik
router.get("/", MarathonController.getAll);
router.get("/:id", MarathonController.getById);

// Khusus Admin: tambah, edit, hapus collection & tambah/hapus film dari collection
router.post("/", requireAuth, requireAdmin, MarathonController.create);
router.put("/:id", requireAuth, requireAdmin, MarathonController.update);
router.post("/:id/movies", requireAuth, requireAdmin, MarathonController.addMovie);
router.delete("/:id/movies/:movieId", requireAuth, requireAdmin, MarathonController.removeMovie);
router.delete("/:id", requireAuth, requireAdmin, MarathonController.remove);

export default router;
