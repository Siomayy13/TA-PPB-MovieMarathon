import { MarathonModel } from "../models/marathonModel.js";

export const MarathonController = {
  async getAll(req, res) {
    try {
      const { search } = req.query;
      const marathons = await MarathonModel.getAll({ search });
      res.json(marathons);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const marathon = await MarathonModel.getById(req.params.id);
      res.json(marathon);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      if (!req.body?.title || !String(req.body.title).trim()) {
        return res.status(400).json({ error: "Field 'title' collection wajib diisi." });
      }
      const marathon = await MarathonModel.create(req.body);
      res.status(201).json(marathon);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const marathon = await MarathonModel.update(req.params.id, req.body);
      res.json(marathon);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async addMovie(req, res) {
    try {
      const { movie_id, note } = req.body || {};
      if (!movie_id) {
        return res.status(400).json({ error: "Field 'movie_id' wajib diisi." });
      }
      const marathon = await MarathonModel.addMovie(req.params.id, movie_id, note);
      res.status(201).json(marathon);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async removeMovie(req, res) {
    try {
      const marathon = await MarathonModel.removeMovie(req.params.id, req.params.movieId);
      res.json(marathon);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await MarathonModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
