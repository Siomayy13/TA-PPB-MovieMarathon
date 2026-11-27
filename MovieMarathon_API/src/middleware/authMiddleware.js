import { verifyToken } from "../utils/authCrypto.js";

const extractBearer = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
};

export const optionalAuth = (req, res, next) => {
  const token = extractBearer(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

export const requireAuth = (req, res, next) => {
  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({
      error: "Autentikasi diperlukan. Silakan login terlebih dahulu.",
    });
  }
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({
      error: "Sesi login tidak valid atau telah berakhir. Silakan login ulang.",
    });
  }
  req.user = decoded;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Autentikasi diperlukan.",
    });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Akses ditolak. Fitur ini hanya tersedia untuk Admin.",
    });
  }
  next();
};
