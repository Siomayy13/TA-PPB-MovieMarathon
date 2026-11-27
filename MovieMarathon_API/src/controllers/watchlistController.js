import { WatchlistModel } from "../models/watchlistModel.js";

export const WatchlistController = {
  async getByUser(req, res) {
    try {
      const userIdentifier = req.user?.id || req.query.user_identifier;
      if (!userIdentifier) {
        return res
          .status(400)
          .json({ error: "Autentikasi atau 'user_identifier' wajib disertakan." });
      }
      const items = await WatchlistModel.getByUser(userIdentifier);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async toggle(req, res) {
    try {
      const userIdentifier = req.user?.id || req.body?.user_identifier;
      const { movie_id } = req.body || {};
      if (!userIdentifier || !movie_id) {
        return res
          .status(400)
          .json({ error: "Autentikasi dan 'movie_id' wajib diisi." });
      }
      const result = await WatchlistModel.toggle(userIdentifier, movie_id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const userIdentifier = req.user?.id || req.query.user_identifier || req.body?.user_identifier;
      if (!userIdentifier) {
        return res
          .status(400)
          .json({ error: "Autentikasi atau 'user_identifier' wajib disertakan." });
      }
      const result = await WatchlistModel.remove(userIdentifier, req.params.movieId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
