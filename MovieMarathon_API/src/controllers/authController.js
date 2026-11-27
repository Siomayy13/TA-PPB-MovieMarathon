import { UserModel } from "../models/userModel.js";
import { signToken } from "../utils/authCrypto.js";

const buildTokenForUser = (user) =>
  signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    display_name: user.display_name,
  });

export const AuthController = {
  async register(req, res) {
    try {
      const { email, password, display_name, favorite_genre, bio } = req.body || {};
      if (!email || !String(email).includes("@")) {
        return res.status(400).json({ error: "Format email tidak valid." });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: "Kata sandi minimal 6 karakter." });
      }
      if (!display_name || !String(display_name).trim()) {
        return res.status(400).json({ error: "Nama tampilan wajib diisi." });
      }

      const user = await UserModel.register({
        email,
        password,
        display_name,
        favorite_genre,
        bio,
      });
      const token = buildTokenForUser(user);
      res.status(201).json({ token, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "Email dan kata sandi wajib diisi." });
      }
      const user = await UserModel.authenticate(email, password);
      const token = buildTokenForUser(user);
      res.json({ token, user });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      res.json({ user });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await UserModel.updateProfile(req.user.id, req.body || {});
      const token = buildTokenForUser(user);
      res.json({ token, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async listUsers(req, res) {
    try {
      const users = await UserModel.listAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { role } = req.body || {};
      const updated = await UserModel.updateRole(req.params.id, role);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
