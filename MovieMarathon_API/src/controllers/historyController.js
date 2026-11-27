import { HistoryModel } from "../models/historyModel.js";

export const HistoryController = {
  async getMine(req, res) {
    try {
      const items = await HistoryModel.getByUser(req.user.id);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async record(req, res) {
    try {
      if (!req.body?.movie_id) {
        return res.status(400).json({ error: "Field 'movie_id' wajib diisi." });
      }
      const item = await HistoryModel.recordAuto(req.user.id, req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const item = await HistoryModel.updateManual(req.params.id, req.user.id, req.body || {});
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await HistoryModel.remove(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
