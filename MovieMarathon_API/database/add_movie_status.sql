-- ============================================================================
-- MIGRASI KOLOM STATUS (Ongoing / Tamat) PADA TABEL MOVIES
-- ============================================================================
-- Jalankan script ini di Supabase SQL Editor pada project MovieMarathon-TA-API.
-- Aman dijalankan tanpa menghapus data film yang sudah ada!
-- ============================================================================

-- 1. Tambah kolom status ('Ongoing' atau 'Tamat') ke tabel movies
ALTER TABLE movies
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Tamat';

-- 2. Tandai beberapa judul populer/terbaru sebagai 'Ongoing' agar filter Ongoing & Tamat langsung terlihat
UPDATE movies
SET status = 'Ongoing'
WHERE title IN ('Queen of Tears', 'Oppenheimer', 'The Glory');
