import { getSupabase } from "../config/supabaseClient.js";

const formatHistoryRow = (row) => {
  if (!row) return null;
  const movie = row.movies
    ? {
        ...row.movies,
        rating:
          row.movies.rating !== null && row.movies.rating !== undefined
            ? Number(row.movies.rating)
            : 0,
        cast: row.movies.cast_members || "",
        cast_members: row.movies.cast_members || "",
        status: row.movies.status || "Tamat",
      }
    : null;

  const { movies, episodes, ...rest } = row;
  return {
    ...rest,
    movie,
    episode: episodes || null,
  };
};

export const HistoryModel = {
  async getByUser(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("watch_history")
      .select(
        `
        *,
        movies ( * ),
        episodes ( id, episode_number, title, duration )
        `
      )
      .eq("user_id", userId)
      .order("watched_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(formatHistoryRow);
  },

  async recordAuto(userId, payload) {
    const supabase = getSupabase();
    const movieId = payload.movie_id;
    const totalEpisodes = Math.max(1, Number(payload.total_episodes) || 1);
    const rawLastEp =
      payload.last_episode_number !== undefined ? Number(payload.last_episode_number) : 1;
    const lastEp = Math.min(totalEpisodes, Math.max(0, Number.isNaN(rawLastEp) ? 0 : rawLastEp));

    // Jika user membatalkan semua status ditonton (0 episode), hapus entri histori dari database
    if (lastEp === 0 && payload.remove_if_empty) {
      const { error: delErr } = await supabase
        .from("watch_history")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movieId);
      if (delErr) throw delErr;
      return { removed: true, movie_id: movieId };
    }

    // Cek apakah sudah ada histori untuk user & movie ini
    const { data: existing } = await supabase
      .from("watch_history")
      .select("*")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .maybeSingle();

    const computedPercent =
      payload.progress_percent !== undefined
        ? Math.min(100, Math.max(0, Number(payload.progress_percent)))
        : Math.round((lastEp / totalEpisodes) * 100);

    const isDone = lastEp > 0 && (computedPercent >= 100 || lastEp >= totalEpisodes);
    let nextStatus = payload.watch_status || (isDone ? "Selesai" : "Sedang Ditonton");
    let nextWatchCount = existing ? Number(existing.watch_count) || 1 : 1;

    // Jika sebelumnya sudah selesai dan user menonton selesai lagi -> naikkan watch_count
    if (existing && payload.increment_watch_count) {
      nextWatchCount += 1;
      if (!payload.watch_status) {
        nextStatus = isDone ? "Selesai" : "Ditonton Ulang";
      }
    }

    const now = new Date().toISOString();
    const record = {
      user_id: userId,
      movie_id: movieId,
      episode_id: payload.episode_id !== undefined ? payload.episode_id : existing?.episode_id || null,
      last_episode_number: lastEp,
      total_episodes: totalEpisodes,
      watch_status: nextStatus,
      progress_percent: computedPercent,
      watch_count: nextWatchCount,
      notes: payload.notes !== undefined ? payload.notes : existing?.notes || "",
      watched_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("watch_history")
      .upsert([record], { onConflict: "user_id,movie_id" })
      .select(
        `
        *,
        movies ( * ),
        episodes ( id, episode_number, title, duration )
        `
      )
      .single();
    if (error) throw error;
    return formatHistoryRow(data);
  },

  async updateManual(id, userId, payload) {
    const supabase = getSupabase();
    const allowedStatuses = new Set(["Sedang Ditonton", "Selesai", "Ditonton Ulang"]);

    const record = {
      updated_at: new Date().toISOString(),
    };

    if (payload.watch_status && allowedStatuses.has(payload.watch_status)) {
      record.watch_status = payload.watch_status;
    }
    if (payload.total_episodes !== undefined) {
      record.total_episodes = Math.max(1, Number(payload.total_episodes) || 1);
    }
    if (payload.last_episode_number !== undefined) {
      record.last_episode_number = Math.max(0, Number(payload.last_episode_number) || 0);
    }
    if (payload.progress_percent !== undefined) {
      record.progress_percent = Math.min(100, Math.max(0, Number(payload.progress_percent) || 0));
    }
    if (payload.watch_count !== undefined) {
      record.watch_count = Math.max(1, Number(payload.watch_count) || 1);
    }
    if (payload.notes !== undefined) {
      record.notes = String(payload.notes);
    }
    if (payload.touch_watched_at) {
      record.watched_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("watch_history")
      .update(record)
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        `
        *,
        movies ( * ),
        episodes ( id, episode_number, title, duration )
        `
      )
      .single();
    if (error) throw error;
    return formatHistoryRow(data);
  },

  async remove(id, userId) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("watch_history")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { message: "Watch history entry deleted", id };
  },
};
