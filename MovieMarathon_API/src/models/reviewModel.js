import { getSupabase } from "../config/supabaseClient.js";

/**
 * Sinkronkan kolom movies.rating (skala 0–10) secara otomatis
 * dari rata-rata bintang (1–5) pada tabel reviews.
 */
const syncMovieRatingFromReviews = async (supabase, movieId) => {
  if (!movieId) return;
  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("movie_id", movieId);

    const list = reviews || [];
    const avgScale10 =
      list.length > 0
        ? Math.round(
            (list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length) * 2 * 10
          ) / 10
        : 0;

    await supabase
      .from("movies")
      .update({ rating: avgScale10, updated_at: new Date().toISOString() })
      .eq("id", movieId);
  } catch {
    // Tetap aman jika sync gagal sementara
  }
};

export const ReviewModel = {
  async getAll() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, movies ( id, title )")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByMovieId(movieId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create({ movie_id, user_id = null, user_name, rating, comment }) {
    const supabase = getSupabase();
    const record = {
      movie_id,
      user_name: user_name || "Penonton Marathon",
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment,
    };
    if (user_id) record.user_id = user_id;

    const { data, error } = await supabase
      .from("reviews")
      .insert([record])
      .select()
      .single();
    if (error) throw error;

    await syncMovieRatingFromReviews(supabase, movie_id);
    return data;
  },

  async remove(id) {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("reviews")
      .select("movie_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;

    if (existing?.movie_id) {
      await syncMovieRatingFromReviews(supabase, existing.movie_id);
    }
    return { message: "Review deleted successfully", id };
  },
};
