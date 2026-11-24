import { ReviewModel } from "../models/reviewModel.js";

export const ReviewController = {
  async getAll(req, res) {
    try {
      const reviews = await ReviewModel.getAll();
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByMovieId(req, res) {
    try {
      const reviews = await ReviewModel.getByMovieId(req.params.movieId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { movie_id, user_name, rating, comment } = req.body;
      if (!movie_id || !comment || !String(comment).trim()) {
        return res
          .status(400)
          .json({ error: "Field 'movie_id' dan 'comment' wajib diisi." });
      }
      const review = await ReviewModel.create({
        movie_id,
        user_name: user_name || "Penonton Marathon",
        rating: rating || 5,
        comment: String(comment).trim(),
      });
      res.status(201).json(review);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await ReviewModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
