import express from "express";
import { GenreController } from "../controllers/genreController.js";

const router = express.Router();

router.get("/", GenreController.getAll);
router.get("/:id", GenreController.getById);
router.post("/", GenreController.create);
router.put("/:id", GenreController.update);
router.delete("/:id", GenreController.remove);

export default router;
