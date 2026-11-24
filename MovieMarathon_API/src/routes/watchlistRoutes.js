import express from "express";
import { WatchlistController } from "../controllers/watchlistController.js";

const router = express.Router();

router.get("/", WatchlistController.getByUser);
router.post("/toggle", WatchlistController.toggle);
router.delete("/:movieId", WatchlistController.remove);

export default router;
