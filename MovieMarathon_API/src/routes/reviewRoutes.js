import express from "express";
import { ReviewController } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", ReviewController.getAll);
router.get("/movie/:movieId", ReviewController.getByMovieId);
router.post("/", ReviewController.create);
router.delete("/:id", ReviewController.remove);

export default router;
