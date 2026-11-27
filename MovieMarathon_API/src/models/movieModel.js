import { getSupabase } from "../config/supabaseClient.js";

const formatMovieRow = (row, reviewStats = null, trendingRank = null, latestEp = null) => {
  if (!row) return null;
  const stats = reviewStats || {
    review_count: 0,
    total_stars: 0,
    average_review_rating: 0,
  };
  const rank = trendingRank ?? null;
  const isTrending = rank !== null && rank >= 1 && rank <= 10;

  // Jika film sudah memiliki ulasan pengguna, gunakan skor otomatis (skala 0-10) dari rata-rata bintang ulasan;
  // jika belum ada ulasan, gunakan nilai rating tersimpan (default 0 untuk film baru).
  const storedRating = row.rating !== null && row.rating !== undefined ? Number(row.rating) : 0;
  const effectiveRating =
    stats.review_count > 0
      ? Math.round(stats.average_review_rating * 2 * 10) / 10
      : storedRating;

  const latestUploadAt =
    latestEp?.created_at || row.created_at || new Date().toISOString();

  return {
    ...row,
    rating: effectiveRating,
    cast: row.cast_members || "",
    cast_members: row.cast_members || "",
    status: row.status || "Tamat",
    review_count: stats.review_count,
    total_stars: stats.total_stars,
    average_review_rating: stats.average_review_rating,
    trending_rank: rank,
    featured: isTrending,
    isTrending,
    episode_count: latestEp?.episode_count ?? 0,
    latest_episode_number: latestEp?.episode_number ?? null,
    latest_episode_title: latestEp?.title ?? null,
    latest_episode_uploaded_at: latestEp?.created_at ?? null,
    latest_upload_at: latestUploadAt,
    createdAt: row.created_at || new Date().toISOString(),
    category_name: row.categories?.name || row.type || "Movie",
  };
};

const computeReviewStatsMap = async (supabase) => {
  const { data: reviews } = await supabase.from("reviews").select("movie_id, rating");
  const statsMap = new Map();

  (reviews || []).forEach((rev) => {
    const key = String(rev.movie_id);
    const curr = statsMap.get(key) || { count: 0, sum: 0 };
    curr.count += 1;
    curr.sum += Number(rev.rating) || 0;
    statsMap.set(key, curr);
  });

  const result = new Map();
  statsMap.forEach((val, key) => {
    result.set(key, {
      review_count: val.count,
      total_stars: val.sum,
      average_review_rating: val.count > 0 ? Math.round((val.sum / val.count) * 10) / 10 : 0,
    });
  });
  return result;
};

/**
 * Mengambil episode terakhir yang diupload per film beserta timestamp created_at-nya
 * untuk ditampilkan di bagian "Baru Diupload".
 */
const computeLatestEpisodesMap = async (supabase) => {
  try {
    const { data: episodes, error } = await supabase
      .from("episodes")
      .select("movie_id, episode_number, title, created_at")
      .order("created_at", { ascending: false })
      .order("episode_number", { ascending: false });

    if (error || !Array.isArray(episodes)) return new Map();

    const map = new Map();
    episodes.forEach((ep) => {
      const key = String(ep.movie_id);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          episode_number: Number(ep.episode_number) || 1,
          title: ep.title || `Episode ${ep.episode_number}`,
          created_at: ep.created_at || null,
          episode_count: 1,
        });
      } else {
        existing.episode_count += 1;
      }
    });
    return map;
  } catch {
    return new Map();
  }
};

/**
 * Urutan Trending Otomatis (Top 10) berdasarkan ulasan/rating bintang pengguna:
 * 1. Film yang memiliki ulasan diprioritaskan di atas yang belum ada ulasan.
 * 2. Rata-rata bintang ulasan tertinggi (average_review_rating DESC).
 * 3. Jumlah ulasan terbanyak (review_count DESC).
 * 4. Total bintang terbanyak (total_stars DESC).
 * 5. Fallback skor rating film (rating DESC).
 */
const rankMoviesForTrending = (rows, statsMap) => {
  return [...rows].sort((a, b) => {
    const sA = statsMap.get(String(a.id)) || {
      review_count: 0,
      total_stars: 0,
      average_review_rating: 0,
    };
    const sB = statsMap.get(String(b.id)) || {
      review_count: 0,
      total_stars: 0,
      average_review_rating: 0,
    };

    const hasRevA = sA.review_count > 0 ? 1 : 0;
    const hasRevB = sB.review_count > 0 ? 1 : 0;
    if (hasRevB !== hasRevA) return hasRevB - hasRevA;

    if (sB.average_review_rating !== sA.average_review_rating) {
      return sB.average_review_rating - sA.average_review_rating;
    }
    if (sB.review_count !== sA.review_count) {
      return sB.review_count - sA.review_count;
    }
    if (sB.total_stars !== sA.total_stars) {
      return sB.total_stars - sA.total_stars;
    }
    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
  });
};

const resolveCategoryId = async (supabase, type, providedCategoryId) => {
  if (providedCategoryId) return providedCategoryId;
  if (!type) return null;
  const { data } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", type)
    .maybeSingle();
  return data?.id || null;
};

const syncMovieGenres = async (supabase, movieId, genreText) => {
  if (!movieId || !genreText) return;
  try {
    const { data: allGenres } = await supabase.from("genres").select("id, name");
    if (!Array.isArray(allGenres) || allGenres.length === 0) return;
    const lower = String(genreText).toLowerCase();
    const matchedIds = allGenres
      .filter((g) => lower.includes(g.name.toLowerCase()))
      .map((g) => g.id);

    await supabase.from("movie_genres").delete().eq("movie_id", movieId);
    if (matchedIds.length > 0) {
      await supabase
        .from("movie_genres")
        .insert(matchedIds.map((genre_id) => ({ movie_id: movieId, genre_id })));
    }
  } catch {
    // Tetap aman jika tabel genres belum dimigrasi
  }
};

export const MovieModel = {
  async getAll({ search, type, genre, status, category_id, sort = "created_at", order = "desc" } = {}) {
    const supabase = getSupabase();
    const allowedSort = new Set(["created_at", "rating", "release_year", "title"]);
    const sortColumn = allowedSort.has(sort) ? sort : "created_at";
    const ascending = String(order).toLowerCase() === "asc";

    let query = supabase
      .from("movies")
      .select("*, categories ( id, name )")
      .order(sortColumn, { ascending });

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(
        `title.ilike.%${q}%,genre.ilike.%${q}%,director.ilike.%${q}%,cast_members.ilike.%${q}%`
      );
    }

    if (type && type !== "All") {
      query = query.eq("type", type);
    }

    if (genre && genre !== "All") {
      query = query.ilike("genre", `%${genre.trim()}%`);
    }

    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    const [{ data, error }, statsMap, latestEpMap, { data: allMovieRows }] = await Promise.all([
      query,
      computeReviewStatsMap(supabase),
      computeLatestEpisodesMap(supabase),
      supabase.from("movies").select("id, rating"),
    ]);
    if (error) throw error;

    // Hitung peringkat Top 10 Trending global berdasarkan ulasan pengguna
    const rankedAll = rankMoviesForTrending(allMovieRows || [], statsMap);
    const rankMap = new Map();
    rankedAll.slice(0, 10).forEach((m, idx) => {
      rankMap.set(String(m.id), idx + 1);
    });

    return (data || []).map((row) =>
      formatMovieRow(
        row,
        statsMap.get(String(row.id)),
        rankMap.get(String(row.id)) ?? null,
        latestEpMap.get(String(row.id)) ?? null
      )
    );
  },

  async getTrending(limit = 10) {
    const supabase = getSupabase();
    const [{ data, error }, statsMap, latestEpMap] = await Promise.all([
      supabase.from("movies").select("*, categories ( id, name )"),
      computeReviewStatsMap(supabase),
      computeLatestEpisodesMap(supabase),
    ]);
    if (error) throw error;

    const maxItems = Math.min(10, Math.max(1, Number(limit) || 10));
    const ranked = rankMoviesForTrending(data || [], statsMap).slice(0, maxItems);

    return ranked.map((row, idx) =>
      formatMovieRow(
        row,
        statsMap.get(String(row.id)),
        idx + 1,
        latestEpMap.get(String(row.id)) ?? null
      )
    );
  },

  async getById(id) {
    const supabase = getSupabase();
    const [{ data, error }, statsMap, { data: episodes }] = await Promise.all([
      supabase
        .from("movies")
        .select("*, categories ( id, name ), reviews ( id, user_id, user_name, rating, comment, created_at )")
        .eq("id", id)
        .single(),
      computeReviewStatsMap(supabase),
      supabase
        .from("episodes")
        .select("*")
        .eq("movie_id", id)
        .order("episode_number", { ascending: true }),
    ]);
    if (error) throw error;

    const epList = episodes || [];
    let latestEp = null;
    if (epList.length > 0) {
      const sortedByUpload = [...epList].sort((a, b) => {
        const tDiff = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        if (tDiff !== 0) return tDiff;
        return (Number(b.episode_number) || 0) - (Number(a.episode_number) || 0);
      });
      latestEp = {
        episode_number: Number(sortedByUpload[0].episode_number) || 1,
        title: sortedByUpload[0].title,
        created_at: sortedByUpload[0].created_at || null,
        episode_count: epList.length,
      };
    }

    const formatted = formatMovieRow(data, statsMap.get(String(data.id)), null, latestEp);
    return {
      ...formatted,
      episodes: epList,
    };
  },

  async create(payload) {
    const supabase = getSupabase();
    const movieType = payload.type || payload.category || "Movie";
    const categoryId = await resolveCategoryId(supabase, movieType, payload.category_id);

    // Default rating = 0 (belum ada rating; akan terisi otomatis dari ulasan pengguna)
    const parsedRating =
      payload.rating !== undefined && payload.rating !== null && payload.rating !== ""
        ? Number(payload.rating)
        : 0;

    const record = {
      title: payload.title || payload.name,
      category_id: categoryId,
      type: movieType,
      genre: payload.genre || "Drama",
      release_year: Number(payload.release_year || payload.year || 2024),
      duration: payload.duration || "120 mins",
      rating: Number.isNaN(parsedRating) ? 0 : Math.min(10, Math.max(0, parsedRating)),
      director: payload.director || "Unknown",
      cast_members: payload.cast_members ?? payload.cast ?? "Various Artists",
      streaming_on: payload.streaming_on || "Netflix",
      description: payload.description || payload.synopsis || "",
      image_url: payload.image_url || payload.image || "",
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      status: payload.status === "Ongoing" ? "Ongoing" : "Tamat",
      featured: false,
    };

    const { data, error } = await supabase
      .from("movies")
      .insert([record])
      .select("*, categories ( id, name )")
      .single();
    if (error) throw error;
    await syncMovieGenres(supabase, data.id, record.genre);
    return formatMovieRow(data);
  },

  async update(id, payload) {
    const supabase = getSupabase();
    const record = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined || payload.name !== undefined) {
      record.title = payload.title ?? payload.name;
    }
    if (payload.type !== undefined) {
      record.type = payload.type;
      record.category_id = await resolveCategoryId(supabase, payload.type, payload.category_id);
    } else if (payload.category_id !== undefined) {
      record.category_id = payload.category_id;
    }
    if (payload.genre !== undefined) record.genre = payload.genre;
    if (payload.release_year !== undefined || payload.year !== undefined) {
      record.release_year = Number(payload.release_year ?? payload.year);
    }
    if (payload.duration !== undefined) record.duration = payload.duration;
    if (payload.rating !== undefined && payload.rating !== null && payload.rating !== "") {
      const r = Number(payload.rating);
      if (!Number.isNaN(r)) record.rating = Math.min(10, Math.max(0, r));
    }
    if (payload.director !== undefined) record.director = payload.director;
    if (payload.cast_members !== undefined || payload.cast !== undefined) {
      record.cast_members = payload.cast_members ?? payload.cast;
    }
    if (payload.streaming_on !== undefined) record.streaming_on = payload.streaming_on;
    if (payload.description !== undefined || payload.synopsis !== undefined) {
      record.description = payload.description ?? payload.synopsis;
    }
    if (payload.image_url !== undefined || payload.image !== undefined) {
      record.image_url = payload.image_url ?? payload.image;
    }
    if (Array.isArray(payload.tags)) record.tags = payload.tags;
    if (payload.status !== undefined) {
      record.status = payload.status === "Ongoing" ? "Ongoing" : "Tamat";
    }

    const { data, error } = await supabase
      .from("movies")
      .update(record)
      .eq("id", id)
      .select("*, categories ( id, name )")
      .single();
    if (error) throw error;
    if (record.genre !== undefined) {
      await syncMovieGenres(supabase, data.id, record.genre);
    }
    return formatMovieRow(data);
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) throw error;
    return { message: "Movie deleted successfully", id };
  },
};
