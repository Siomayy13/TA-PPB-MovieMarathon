import { getSupabase } from "../config/supabaseClient.js";

const formatMovieRow = (row) => {
  if (!row) return null;
  const isTrending = Boolean(row.featured);
  return {
    ...row,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 8.0,
    cast: row.cast_members || "",
    cast_members: row.cast_members || "",
    status: row.status || "Tamat",
    featured: isTrending,
    isTrending,
    createdAt: row.created_at || new Date().toISOString(),
    category_name: row.categories?.name || row.type || "Movie",
  };
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

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(formatMovieRow);
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("movies")
      .select("*, categories ( id, name ), reviews ( id, user_name, rating, comment, created_at )")
      .eq("id", id)
      .single();
    if (error) throw error;
    return formatMovieRow(data);
  },

  async create(payload) {
    const supabase = getSupabase();
    const movieType = payload.type || payload.category || "Movie";
    const categoryId = await resolveCategoryId(supabase, movieType, payload.category_id);

    const record = {
      title: payload.title || payload.name,
      category_id: categoryId,
      type: movieType,
      genre: payload.genre || "Drama",
      release_year: Number(payload.release_year || payload.year || 2024),
      duration: payload.duration || "120 mins",
      rating: Number(payload.rating ?? 8.0),
      director: payload.director || "Unknown",
      cast_members: payload.cast_members ?? payload.cast ?? "Various Artists",
      streaming_on: payload.streaming_on || "Netflix",
      description: payload.description || payload.synopsis || "",
      image_url: payload.image_url || payload.image || "",
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      status: payload.status === "Ongoing" ? "Ongoing" : "Tamat",
      featured: Boolean(payload.isTrending ?? payload.featured),
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
    if (payload.rating !== undefined) record.rating = Number(payload.rating);
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
    if (payload.featured !== undefined || payload.isTrending !== undefined) {
      record.featured = Boolean(payload.isTrending ?? payload.featured);
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
