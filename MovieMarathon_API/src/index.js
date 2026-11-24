import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { isSupabaseConfigured } from "./config/supabaseClient.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import marathonRoutes from "./routes/marathonRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";

dotenv.config();

const app = express();

// Middleware CORS agar PWA frontend (localhost / Vercel) dapat mengakses API
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check & root info
app.get("/", (req, res) => {
  res.json({
    service: "Movie Marathon RESTful API",
    version: "1.0.0",
    description: "Web Service Backend untuk Tugas Akhir Praktikum PPB (Modul 1 Express.js + Supabase)",
    database_configured: isSupabaseConfigured,
    endpoints: {
      categories: "/api/categories",
      genres: "/api/genres",
      movies: "/api/movies",
      marathons: "/api/marathons",
      reviews: "/api/reviews",
      reviewsByMovie: "/api/reviews/movie/:movieId",
      watchlist: "/api/watchlist?user_identifier=<uuid>",
      toggleWatchlist: "POST /api/watchlist/toggle",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database_configured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Register Modul 1 RESTful API Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/marathons", marathonRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan.`,
  });
});

// Start local server (Vercel serverless akan langsung mengekspor `app`)
const port = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Movie Marathon API running on http://localhost:${port}`);
  });
}

export default app;
