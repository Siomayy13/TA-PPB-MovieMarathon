import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { isSupabaseConfigured } from "./config/supabaseClient.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import episodeRoutes from "./routes/episodeRoutes.js";
import marathonRoutes from "./routes/marathonRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check & root info
app.get("/", (req, res) => {
  res.json({
    service: "Movie Marathon RESTful API",
    version: "2.0.0",
    description: "Web Service Backend Movie Marathon (Express.js + Supabase PostgreSQL)",
    database_configured: isSupabaseConfigured,
    endpoints: {
      auth: "/api/auth (POST /register, POST /login, GET /me, PUT /profile, GET /users)",
      categories: "/api/categories",
      genres: "/api/genres",
      movies: "/api/movies",
      trendingTop10: "/api/movies/trending",
      episodes: "/api/episodes/movie/:movieId",
      collections: "/api/marathons (+ POST/DELETE /:id/movies)",
      reviews: "/api/reviews & /api/reviews/movie/:movieId",
      watchlist: "/api/watchlist (auth required)",
      watchHistory: "/api/history (auth required)",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "2.0.0",
    database_configured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Register RESTful API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/marathons", marathonRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/history", historyRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan.`,
  });
});

const port = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Movie Marathon API running on http://localhost:${port}`);
  });
}

export default app;
