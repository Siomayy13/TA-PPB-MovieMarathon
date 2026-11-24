import { MarathonModel } from "../models/marathonModel.js";

export const MarathonController = {
  async getAll(req, res) {
    try {
      const { search, difficulty } = req.query;
      const marathons = await MarathonModel.getAll({ search, difficulty });
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
        return res.status(400).json({ error: "Field 'title' paket marathon wajib diisi." });
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

  async remove(req, res) {
    try {
      const result = await MarathonModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
