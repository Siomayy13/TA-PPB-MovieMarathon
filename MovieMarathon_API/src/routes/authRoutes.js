import express from "express";
import { AuthController } from "../controllers/authController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", requireAuth, AuthController.me);
router.put("/profile", requireAuth, AuthController.updateProfile);

// Admin manajemen role user
router.get("/users", requireAuth, requireAdmin, AuthController.listUsers);
router.put("/users/:id/role", requireAuth, requireAdmin, AuthController.updateUserRole);

export default router;
