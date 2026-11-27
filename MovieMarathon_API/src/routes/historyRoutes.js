import express from "express";
import { HistoryController } from "../controllers/historyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua endpoint histori tontonan hanya untuk user yang sudah login
router.use(requireAuth);

router.get("/", HistoryController.getMine);
router.post("/record", HistoryController.record);
router.put("/:id", HistoryController.update);
router.delete("/:id", HistoryController.remove);

export default router;
