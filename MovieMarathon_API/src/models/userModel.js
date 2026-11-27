import { getSupabase } from "../config/supabaseClient.js";
import { hashPassword, verifyPassword } from "../utils/authCrypto.js";

const sanitizeUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role || "pengguna",
    display_name: row.display_name,
    favorite_genre: row.favorite_genre || "",
    bio: row.bio || "",
    avatar_url: row.avatar_url || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const UserModel = {
  async findByEmail(email) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", String(email).trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeUser(data);
  },

  async listAll() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, display_name, favorite_genre, bio, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(sanitizeUser);
  },

  async register({ email, password, display_name, favorite_genre = "", bio = "" }) {
    const supabase = getSupabase();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
    }

    const password_hash = hashPassword(password);
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: normalizedEmail,
          password_hash,
          role: "pengguna",
          display_name: String(display_name).trim(),
          favorite_genre: String(favorite_genre || "").trim(),
          bio: String(bio || "").trim(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return sanitizeUser(data);
  },

  async authenticate(email, password) {
    const row = await this.findByEmail(email);
    if (!row) {
      throw new Error("Email atau kata sandi salah.");
    }
    const ok = verifyPassword(password, row.password_hash);
    if (!ok) {
      throw new Error("Email atau kata sandi salah.");
    }
    return sanitizeUser(row);
  },

  async updateProfile(id, payload) {
    const supabase = getSupabase();
    const record = { updated_at: new Date().toISOString() };

    if (payload.display_name !== undefined && String(payload.display_name).trim()) {
      record.display_name = String(payload.display_name).trim();
    }
    if (payload.favorite_genre !== undefined) {
      record.favorite_genre = String(payload.favorite_genre).trim();
    }
    if (payload.bio !== undefined) {
      record.bio = String(payload.bio).trim();
    }
    if (payload.avatar_url !== undefined) {
      record.avatar_url = payload.avatar_url || "";
    }

    const { data, error } = await supabase
      .from("users")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return sanitizeUser(data);
  },

  async updateRole(id, role) {
    const supabase = getSupabase();
    if (role !== "pengguna" && role !== "admin") {
      throw new Error("Role harus 'pengguna' atau 'admin'.");
    }
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return sanitizeUser(data);
  },
};
