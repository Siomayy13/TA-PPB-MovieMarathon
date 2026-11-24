import { getSupabase } from "../config/supabaseClient.js";

export const WatchlistModel = {
  async getByUser(userIdentifier) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("watchlist")
      .select("id, user_identifier, movie_id, created_at, movies ( * )")
      .eq("user_identifier", userIdentifier)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      movie_id: row.movie_id,
      user_identifier: row.user_identifier,
      created_at: row.created_at,
      movie: row.movies
        ? {
            ...row.movies,
            rating: Number(row.movies.rating ?? 8.0),
            cast: row.movies.cast_members || "",
          }
        : null,
    }));
  },

  async toggle(userIdentifier, movieId) {
    const supabase = getSupabase();
    const { data: existing, error: fetchError } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_identifier", userIdentifier)
      .eq("movie_id", movieId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      const { error: delError } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", existing.id);
      if (delError) throw delError;
      return { is_watchlisted: false, movie_id: movieId };
    }

    const { data: created, error: insertError } = await supabase
      .from("watchlist")
      .insert([{ user_identifier: userIdentifier, movie_id: movieId }])
      .select()
      .single();
    if (insertError) throw insertError;
    return { is_watchlisted: true, movie_id: movieId, record: created };
  },

  async remove(userIdentifier, movieId) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_identifier", userIdentifier)
      .eq("movie_id", movieId);
    if (error) throw error;
    return { message: "Removed from watchlist", movie_id: movieId };
  },
};
