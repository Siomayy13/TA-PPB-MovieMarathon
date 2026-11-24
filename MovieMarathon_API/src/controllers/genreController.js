import { GenreModel } from "../models/genreModel.js";

export const GenreController = {
  async getAll(req, res) {
    try {
      const genres = await GenreModel.getAll();
      res.json(genres);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const genre = await GenreModel.getById(req.params.id);
      res.json(genre);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      if (!req.body?.name || !String(req.body.name).trim()) {
        return res.status(400).json({ error: "Field 'name' genre wajib diisi." });
      }
      const genre = await GenreModel.create(req.body);
      res.status(201).json(genre);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const genre = await GenreModel.update(req.params.id, req.body);
      res.json(genre);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await GenreModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
