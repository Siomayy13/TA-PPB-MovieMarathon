import { getSupabase } from "../config/supabaseClient.js";

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

  async create({ movie_id, user_name, rating, comment }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          movie_id,
          user_name: user_name || "Penonton Marathon",
          rating: Math.min(5, Math.max(1, Number(rating) || 5)),
          comment,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return { message: "Review deleted successfully", id };
  },
};
