import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const rawUrl = (process.env.SUPABASE_URL || "").trim();
// Otomatis bersihkan akhiran /rest/v1 atau slash agar kompatibel dengan @supabase/supabase-js
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
const supabaseKey = (process.env.SUPABASE_KEY || "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let client = null;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn(
    "[MovieMarathon API] SUPABASE_URL atau SUPABASE_KEY belum diisi di file .env."
  );
}

export const getSupabase = () => {
  if (!client) {
    throw new Error(
      "Database belum terkonfigurasi: isi SUPABASE_URL dan SUPABASE_KEY pada file .env (atau Environment Variables di Vercel)."
    );
  }
  return client;
};

export const supabase = client;
