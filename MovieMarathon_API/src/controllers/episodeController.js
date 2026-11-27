import { EpisodeModel } from "../models/episodeModel.js";

export const EpisodeController = {
  async getByMovieId(req, res) {
    try {
      const episodes = await EpisodeModel.getByMovieId(req.params.movieId);
      res.json(episodes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const episode = await EpisodeModel.getById(req.params.id);
      res.json(episode);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { movie_id, title, video_url } = req.body || {};
      if (!movie_id || !title || !video_url) {
        return res.status(400).json({
          error: "Field 'movie_id', 'title', dan 'video_url' wajib diisi.",
        });
      }
      const created = await EpisodeModel.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await EpisodeModel.update(req.params.id, req.body || {});
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await EpisodeModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
