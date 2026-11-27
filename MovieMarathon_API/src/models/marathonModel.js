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
            status: m.status || "Tamat",
            watch_order: item.watch_order,
            note: item.note || "",
          };
        })
        .filter((m) => Boolean(m.id))
    : [];

  const samplePosters = linked
    .map((m) => m.image_url)
    .filter(Boolean)
    .slice(0, 4);

  const { marathon_movies, ...rest } = row;
  return {
    ...rest,
    movie_count: linked.length,
    sample_posters: samplePosters,
    movies: linked,
  };
};

const MARATHON_SELECT = `
  *,
  marathon_movies (
    watch_order,
    note,
    movies (
      id, title, type, genre, release_year, duration, rating, status,
      director, cast_members, streaming_on, description, image_url, tags
    )
  )
`;

export const MarathonModel = {
  async getAll({ search } = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from("marathons")
      .select(MARATHON_SELECT)
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(
        `title.ilike.%${q}%,theme.ilike.%${q}%,mood.ilike.%${q}%,description.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(formatMarathonRow);
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("marathons")
      .select(MARATHON_SELECT)
      .eq("id", id)
      .single();
    if (error) throw error;
    return formatMarathonRow(data);
  },

  async create(payload) {
    const supabase = getSupabase();
    const record = {
      title: payload.title,
      theme: payload.theme || "Custom Collection",
      mood: payload.mood || "Seru & Santai",
      difficulty: "Collection",
      total_duration: payload.total_duration || "4 Jam",
      description: payload.description || "",
      snack_recommendation: payload.snack_recommendation || "Popcorn & minuman favorit",
      break_schedule:
        payload.break_schedule || "Istirahat 15 menit setiap selesai 1 film/2 episode.",
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
      const validIds = [...new Set(payload.movie_ids.filter(Boolean))];
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

  async addMovie(marathonId, movieId, note = "") {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("marathon_movies")
      .select("watch_order")
      .eq("marathon_id", marathonId)
      .order("watch_order", { ascending: false })
      .limit(1);

    const nextOrder =
      Array.isArray(existing) && existing.length > 0 ? (existing[0].watch_order || 0) + 1 : 1;

    const { error } = await supabase.from("marathon_movies").upsert(
      [
        {
          marathon_id: marathonId,
          movie_id: movieId,
          watch_order: nextOrder,
          note: note || `Urutan tonton #${nextOrder}`,
        },
      ],
      { onConflict: "marathon_id,movie_id" }
    );
    if (error) throw error;
    return this.getById(marathonId);
  },

  async removeMovie(marathonId, movieId) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("marathon_movies")
      .delete()
      .eq("marathon_id", marathonId)
      .eq("movie_id", movieId);
    if (error) throw error;
    return this.getById(marathonId);
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("marathons").delete().eq("id", id);
    if (error) throw error;
    return { message: "Collection deleted successfully", id };
  },
};
