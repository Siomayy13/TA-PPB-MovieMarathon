import express from "express";
import { WatchlistController } from "../controllers/watchlistController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Watchlist pribadi wajib login agar terikat permanen ke akun pengguna
router.use(requireAuth);

router.get("/", WatchlistController.getByUser);
router.post("/toggle", WatchlistController.toggle);
router.delete("/:movieId", WatchlistController.remove);

export default router;
