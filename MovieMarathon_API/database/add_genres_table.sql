-- ============================================================================
-- MIGRASI TABEL GENRES & RELASI MOVIE_GENRES (SUPABASE SQL EDITOR)
-- ============================================================================
-- Jalankan script ini di Supabase SQL Editor pada project MovieMarathon-TA-API
-- Anda. Aman dijalankan tanpa menghapus data film/collection yang sudah ada!
-- ============================================================================

-- 1. Buat tabel genres
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#e5a93c',
  cover_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat tabel relasi many-to-many movie_genres (Foreign Key ke movies & genres)
CREATE TABLE IF NOT EXISTS movie_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE (movie_id, genre_id)
);

-- 3. Nonaktifkan RLS agar Express API dapat mengakses langsung
ALTER TABLE genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres DISABLE ROW LEVEL SECURITY;

-- 4. Seed data genre populer
INSERT INTO genres (id, name, slug, description, accent_color, cover_url) VALUES
  ('55555555-5555-4555-8555-555555555501', 'Romance', 'romance', 'Kisah cinta menyentuh hati, chemistry hangat, dan romansa tak terlupakan.', '#ec4899', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555502', 'Sci-Fi', 'sci-fi', 'Eksplorasi luar angkasa, perjalanan waktu, dan teknologi masa depan.', '#38bdf8', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555503', 'Thriller', 'thriller', 'Alur penuh ketegangan, misteri psikologis, dan plot twist mengejutkan.', '#ef4444', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555504', 'Drama', 'drama', 'Konflik emosional mendalam dengan karakter kuat dan cerita berkesan.', '#e5a93c', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555505', 'Comedy', 'comedy', 'Tontonan penuh humor segar, komedi gelap, dan momen menghibur.', '#f59e0b', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555506', 'Fantasy', 'fantasy', 'Dunia magis, petualangan imajinatif, dan visual memukau.', '#a855f7', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555507', 'Mystery', 'mystery', 'Teka-teki rumit dan investigasi yang membuat terus menebak hingga akhir.', '#6366f1', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555508', 'Crime', 'crime', 'Dunia kriminal, strategi cerdas, dan pertarungan hukum berisiko tinggi.', '#f97316', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555509', 'Animation', 'animation', 'Karya animasi berkualitas tinggi dengan cerita emosional dan artistik.', '#14b8a6', 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'),
  ('55555555-5555-4555-8555-555555555510', 'History', 'history', 'Kisah biografi dan peristiwa sejarah penting yang menggugah.', '#eab308', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80')
ON CONFLICT (name) DO NOTHING;

-- 5. Hubungkan otomatis semua film yang sudah ada di tabel movies ke tabel movie_genres
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m
JOIN genres g ON m.genre ILIKE '%' || g.name || '%'
ON CONFLICT (movie_id, genre_id) DO NOTHING;

-- 6. Ubah label difficulty lama di tabel marathons menjadi 'Collection'
UPDATE marathons
SET difficulty = 'Collection'
WHERE difficulty IN ('Santai', 'Menengah', 'Hardcore');
