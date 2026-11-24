import { getSupabase } from "../config/supabaseClient.js";

const toSlug = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatMovieRow = (m) => {
  if (!m) return null;
  return {
    ...m,
    rating: m.rating !== null && m.rating !== undefined ? Number(m.rating) : 8.0,
    cast: m.cast_members || "",
    cast_members: m.cast_members || "",
  };
};

export const GenreModel = {
  async getAll() {
    const supabase = getSupabase();
    const { data: genres, error } = await supabase
      .from("genres")
      .select("*, movie_genres ( movie_id )")
      .order("name", { ascending: true });
    if (error) throw error;

    // Juga ambil daftar ringkas movies agar film baru yg genre-nya cocok tetap terhitung akurat
    const { data: allMovies } = await supabase
      .from("movies")
      .select("id, genre");

    return (genres || []).map((g) => {
      const joinedIds = new Set(
        Array.isArray(g.movie_genres) ? g.movie_genres.map((mg) => mg.movie_id) : []
      );
      if (Array.isArray(allMovies)) {
        const lowerName = g.name.toLowerCase();
        allMovies.forEach((m) => {
          if ((m.genre || "").toLowerCase().includes(lowerName)) {
            joinedIds.add(m.id);
          }
        });
      }
      const { movie_genres, ...rest } = g;
      return {
        ...rest,
        movie_count: joinedIds.size,
      };
    });
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data: genre, error } = await supabase
      .from("genres")
      .select("*, movie_genres ( movies ( * ) )")
      .eq("id", id)
      .single();
    if (error) throw error;

    // Gabungkan hasil relasi movie_genres + fallback ilike pada kolom movies.genre
    const map = new Map();
    if (Array.isArray(genre.movie_genres)) {
      genre.movie_genres.forEach((mg) => {
        if (mg.movies?.id) {
          map.set(mg.movies.id, formatMovieRow(mg.movies));
        }
      });
    }

    const { data: matchedMovies } = await supabase
      .from("movies")
      .select("*")
      .ilike("genre", `%${genre.name}%`)
      .order("rating", { ascending: false });

    if (Array.isArray(matchedMovies)) {
      matchedMovies.forEach((m) => {
        if (!map.has(m.id)) {
          map.set(m.id, formatMovieRow(m));
        }
      });
    }

    const movies = Array.from(map.values()).sort(
      (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
    );

    const { movie_genres, ...rest } = genre;
    return {
      ...rest,
      movie_count: movies.length,
      movies,
    };
  },

  async create(payload) {
    const supabase = getSupabase();
    const name = String(payload.name || "").trim();
    const record = {
      name,
      slug: payload.slug ? toSlug(payload.slug) : toSlug(name),
      description: payload.description || `Kumpulan film dan drama bergenre ${name}.`,
      accent_color: payload.accent_color || "#e5a93c",
      cover_url:
        payload.cover_url ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    };

    const { data: created, error } = await supabase
      .from("genres")
      .insert([record])
      .select()
      .single();
    if (error) throw error;

    // Otomatis tautkan film yang sudah memiliki genre ini di kolom movies.genre
    const { data: matchedMovies } = await supabase
      .from("movies")
      .select("id")
      .ilike("genre", `%${name}%`);

    if (Array.isArray(matchedMovies) && matchedMovies.length > 0) {
      await supabase
        .from("movie_genres")
        .upsert(
          matchedMovies.map((m) => ({ movie_id: m.id, genre_id: created.id })),
          { onConflict: "movie_id,genre_id", ignoreDuplicates: true }
        );
    }

    return {
      ...created,
      movie_count: matchedMovies ? matchedMovies.length : 0,
    };
  },

  async update(id, payload) {
    const supabase = getSupabase();
    const record = {};
    if (payload.name !== undefined) {
      record.name = String(payload.name).trim();
      record.slug = toSlug(record.name);
    }
    if (payload.description !== undefined) record.description = payload.description;
    if (payload.accent_color !== undefined) record.accent_color = payload.accent_color;
    if (payload.cover_url !== undefined) record.cover_url = payload.cover_url;

    const { data, error } = await supabase
      .from("genres")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("genres").delete().eq("id", id);
    if (error) throw error;
    return { message: "Genre deleted successfully", id };
  },
};
