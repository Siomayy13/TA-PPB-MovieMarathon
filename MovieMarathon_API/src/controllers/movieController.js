import { MovieModel } from "../models/movieModel.js";

export const MovieController = {
  async getAll(req, res) {
    try {
      const { search, type, genre, status, category_id, sort, order } = req.query;
      const movies = await MovieModel.getAll({
        search,
        type,
        genre,
        status,
        category_id,
        sort,
        order,
      });
      res.json(movies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const movie = await MovieModel.getById(req.params.id);
      res.json(movie);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const title = req.body?.title || req.body?.name;
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: "Field 'title' wajib diisi." });
      }
      const movie = await MovieModel.create(req.body);
      res.status(201).json(movie);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const movie = await MovieModel.update(req.params.id, req.body);
      res.json(movie);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await MovieModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
