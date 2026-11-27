import { getSupabase } from "../config/supabaseClient.js";

export const EpisodeModel = {
  async getByMovieId(movieId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("movie_id", movieId)
      .order("episode_number", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const supabase = getSupabase();
    const record = {
      movie_id: payload.movie_id,
      episode_number: Number(payload.episode_number) || 1,
      title: String(payload.title).trim(),
      duration: payload.duration || "45 mins",
      video_url: String(payload.video_url).trim(),
      thumbnail_url: payload.thumbnail_url || "",
      synopsis: payload.synopsis || "",
    };

    const { data, error } = await supabase
      .from("episodes")
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const supabase = getSupabase();
    const record = {};
    if (payload.episode_number !== undefined) {
      record.episode_number = Number(payload.episode_number);
    }
    if (payload.title !== undefined) record.title = String(payload.title).trim();
    if (payload.duration !== undefined) record.duration = payload.duration;
    if (payload.video_url !== undefined) record.video_url = String(payload.video_url).trim();
    if (payload.thumbnail_url !== undefined) record.thumbnail_url = payload.thumbnail_url;
    if (payload.synopsis !== undefined) record.synopsis = payload.synopsis;

    const { data, error } = await supabase
      .from("episodes")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) throw error;
    return { message: "Episode deleted successfully", id };
  },
};
