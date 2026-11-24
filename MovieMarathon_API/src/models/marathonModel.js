import { getSupabase } from "../config/supabaseClient.js";

const formatMarathonRow = (row) => {
  if (!row) return null;
  const linked = Array.isArray(row.marathon_movies)
    ? [...row.marathon_movies]
        .sort((a, b) => (a.watch_order || 0) - (b.watch_order || 0))
        .map((item) => {
          const m = item.movies || {};
          return {
            ...m,
            rating: m.rating !== null && m.rating !== undefined ? Number(m.rating) : 8.0,
            cast: m.cast_members || "",
            watch_order: item.watch_order,
            note: item.note || "",
          };
        })
        .filter((m) => Boolean(m.id))
    : [];

  const { marathon_movies, ...rest } = row;
  return {
    ...rest,
    movie_count: linked.length,
    movies: linked,
  };
};

export const MarathonModel = {
  async getAll({ search, difficulty } = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from("marathons")
      .select(
        `
        *,
        marathon_movies (
          watch_order,
          note,
          movies (
            id, title, type, genre, release_year, duration, rating,
            director, cast_members, streaming_on, description, image_url, tags
          )
        )
        `
      )
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(
        `title.ilike.%${q}%,theme.ilike.%${q}%,mood.ilike.%${q}%,description.ilike.%${q}%`
      );
    }

    if (difficulty && difficulty !== "All") {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(formatMarathonRow);
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("marathons")
      .select(
        `
        *,
        marathon_movies (
          watch_order,
          note,
          movies (
            id, title, type, genre, release_year, duration, rating,
            director, cast_members, streaming_on, description, image_url, tags
          )
        )
        `
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return formatMarathonRow(data);
  },

  async create(payload) {
    const supabase = getSupabase();
    const record = {
      title: payload.title,
      theme: payload.theme || "Custom Marathon",
      mood: payload.mood || "Seru & Santai",
      difficulty: payload.difficulty || "Collection",
      total_duration: payload.total_duration || "4 Jam",
      description: payload.description || "",
      snack_recommendation: payload.snack_recommendation || "Popcorn & minuman favorit",
      break_schedule: payload.break_schedule || "Istirahat 15 menit setiap selesai 1 film/2 episode.",
      cover_url:
        payload.cover_url ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    };

    const { data: created, error } = await supabase
      .from("marathons")
      .insert([record])
      .select()
      .single();
    if (error) throw error;

    const movieIds = Array.isArray(payload.movie_ids) ? payload.movie_ids.filter(Boolean) : [];
    if (movieIds.length > 0) {
      const rows = movieIds.map((movieId, idx) => ({
        marathon_id: created.id,
        movie_id: movieId,
        watch_order: idx + 1,
        note: `Urutan tonton #${idx + 1}`,
      }));
      const { error: joinError } = await supabase.from("marathon_movies").insert(rows);
      if (joinError) throw joinError;
    }

    return this.getById(created.id);
  },

  async update(id, payload) {
    const supabase = getSupabase();
    const record = { updated_at: new Date().toISOString() };

    if (payload.title !== undefined) record.title = payload.title;
    if (payload.theme !== undefined) record.theme = payload.theme;
    if (payload.mood !== undefined) record.mood = payload.mood;
    if (payload.difficulty !== undefined) record.difficulty = payload.difficulty;
    if (payload.total_duration !== undefined) record.total_duration = payload.total_duration;
    if (payload.description !== undefined) record.description = payload.description;
    if (payload.snack_recommendation !== undefined) {
      record.snack_recommendation = payload.snack_recommendation;
    }
    if (payload.break_schedule !== undefined) record.break_schedule = payload.break_schedule;
    if (payload.cover_url !== undefined) record.cover_url = payload.cover_url;

    const { error } = await supabase.from("marathons").update(record).eq("id", id);
    if (error) throw error;

    if (Array.isArray(payload.movie_ids)) {
      await supabase.from("marathon_movies").delete().eq("marathon_id", id);
      const validIds = payload.movie_ids.filter(Boolean);
      if (validIds.length > 0) {
        const rows = validIds.map((movieId, idx) => ({
          marathon_id: id,
          movie_id: movieId,
          watch_order: idx + 1,
          note: `Urutan tonton #${idx + 1}`,
        }));
        const { error: joinError } = await supabase.from("marathon_movies").insert(rows);
        if (joinError) throw joinError;
      }
    }

    return this.getById(id);
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("marathons").delete().eq("id", id);
    if (error) throw error;
    return { message: "Marathon package deleted successfully", id };
  },
};
