-- ============================================================================
-- MOVIE MARATHON TA PPB — SKEMA DATABASE POSTGRESQL (SUPABASE BARU)
-- ============================================================================
-- Jalankan seluruh script SQL ini sekaligus di Supabase SQL Editor
-- pada project Supabase BARU Anda (berbeda dari database Responsi Modul 5).
-- ============================================================================

-- 1. Tabel Categories (Relasi induk untuk jenis tayangan)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Movies (Halaman Utama List #1: Database Film & Drama)
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'Movie',
  genre TEXT NOT NULL DEFAULT 'Drama',
  release_year INTEGER NOT NULL DEFAULT 2024,
  duration TEXT DEFAULT '120 mins',
  rating NUMERIC(3, 1) DEFAULT 8.0,
  director TEXT DEFAULT 'Unknown',
  cast_members TEXT DEFAULT 'Various Artists',
  streaming_on TEXT DEFAULT 'Netflix',
  description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Marathons (Halaman Utama List #2: Paket & Jadwal Marathon)
CREATE TABLE IF NOT EXISTS marathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  mood TEXT DEFAULT 'Seru & Tegang',
  difficulty TEXT NOT NULL DEFAULT 'Santai',
  total_duration TEXT NOT NULL DEFAULT '4 Jam',
  description TEXT,
  snack_recommendation TEXT,
  break_schedule TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Marathon_Movies (Relasi Many-to-Many antara Marathons & Movies)
CREATE TABLE IF NOT EXISTS marathon_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marathon_id UUID NOT NULL REFERENCES marathons(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  watch_order INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  UNIQUE (marathon_id, movie_id)
);

-- 5. Tabel Reviews (Ulasan & Rating untuk setiap Film/Drama)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Watchlist (Daftar Tontonan per User Identifier)
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_identifier, movie_id)
);

-- Nonaktifkan RLS agar akses anon key dari backend API berjalan lancar (sesuai Modul 1)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE marathons DISABLE ROW LEVEL SECURITY;
ALTER TABLE marathon_movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA AWAL (DATA BARU KHUSUS TUGAS AKHIR)
-- ============================================================================

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
  ('11111111-1111-4111-8111-111111111101', 'K-Drama', 'Serial drama Korea Selatan dengan cerita emosional dan romantis'),
  ('11111111-1111-4111-8111-111111111102', 'Movie', 'Film layar lebar blockbuster dan pemenang penghargaan'),
  ('11111111-1111-4111-8111-111111111103', 'Anime', 'Animasi Jepang dengan visual memukau dan cerita mendalam'),
  ('11111111-1111-4111-8111-111111111104', 'Series', 'Serial internasional dengan alur episode yang menegangkan')
ON CONFLICT (name) DO NOTHING;

-- Seed Movies (10 Judul)
INSERT INTO movies (
  id, title, category_id, type, genre, release_year, duration, rating,
  director, cast_members, streaming_on, description, image_url, tags, featured
) VALUES
  (
    '22222222-2222-4222-8222-222222222201',
    'Queen of Tears',
    '11111111-1111-4111-8111-111111111101',
    'K-Drama',
    'Romance / Drama / Comedy',
    2024,
    '16 Episodes (70m)',
    9.3,
    'Jang Young-woo, Kim Hee-won',
    'Kim Soo-hyun, Kim Ji-won, Park Sung-hoon, Kwak Dong-yeon',
    'Netflix',
    'Ratu department store dan suaminya yang berasal dari kota kecil menghadapi krisis pernikahan hingga cinta mereka perlahan bersemi kembali di tengah intrik korporasi.',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80',
    ARRAY['Binge-Worthy', 'Emotional', 'Masterpiece', 'Top Rated'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'Interstellar',
    '11111111-1111-4111-8111-111111111102',
    'Movie',
    'Sci-Fi / Adventure / Drama',
    2014,
    '169 mins',
    9.5,
    'Christopher Nolan',
    'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    'HBO Max / Prime Video',
    'Ketika Bumi semakin tidak layak huni, seorang mantan pilot NASA bernama Cooper memimpin misi penjelajahan melintasi lubang cacing demi menemukan planet baru bagi umat manusia.',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    ARRAY['Mind-Bending', 'Space Epic', 'Hans Zimmer Score'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    'Crash Landing on You',
    '11111111-1111-4111-8111-111111111101',
    'K-Drama',
    'Romance / Military / Comedy',
    2019,
    '16 Episodes (80m)',
    9.1,
    'Lee Jeong-hyo',
    'Hyun Bin, Son Ye-jin, Seo Ji-hye, Kim Jung-hyun',
    'Netflix',
    'Kecelakaan paralayang membawa seorang pewaris konglomerat Korea Selatan mendarat darurat di wilayah Korea Utara dan bertemu perwira tentara yang melindunginya.',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    ARRAY['Iconic Romance', 'Heartwarming', 'Must-Watch'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    'Spirited Away',
    '11111111-1111-4111-8111-111111111103',
    'Anime',
    'Animation / Fantasy / Adventure',
    2001,
    '125 mins',
    9.2,
    'Hayao Miyazaki',
    'Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito',
    'Netflix / Studio Ghibli',
    'Saat pindah ke kota baru, Chihiro tersesat ke dunia magis penuh roh dan penyihir, lalu harus bekerja di pemandian roh demi menyelamatkan kedua orang tuanya.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    ARRAY['Studio Ghibli', 'Oscar Winner', 'Nostalgic'],
    FALSE
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    'Oppenheimer',
    '11111111-1111-4111-8111-111111111102',
    'Movie',
    'Biography / Drama / History',
    2023,
    '180 mins',
    9.0,
    'Christopher Nolan',
    'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    'Apple TV / Peacock',
    'Kisah fisikawan J. Robert Oppenheimer dalam memimpin Proyek Manhattan untuk mengembangkan bom atom pertama di dunia beserta konsekuensi moralnya.',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    ARRAY['7 Oscars', 'Intense', 'Masterpiece'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222206',
    'Vincenzo',
    '11111111-1111-4111-8111-111111111101',
    'K-Drama',
    'Crime / Dark Comedy / Legal',
    2021,
    '20 Episodes (80m)',
    8.9,
    'Kim Hee-won',
    'Song Joong-ki, Jeon Yeo-been, Ok Taec-yeon, Kwak Dong-yeon',
    'Netflix',
    'Pengacara mafia Italia keturunan Korea kembali ke tanah air dan menghadapi kartel konglomerat korup menggunakan taktik keadilan yang tak terduga.',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    ARRAY['Mafia', 'Dark Comedy', 'Action'],
    FALSE
  ),
  (
    '22222222-2222-4222-8222-222222222207',
    'Parasite',
    '11111111-1111-4111-8111-111111111102',
    'Movie',
    'Thriller / Drama / Satire',
    2019,
    '132 mins',
    9.4,
    'Bong Joon-ho',
    'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    'Prime Video / Hulu',
    'Keserakahan dan kesenjangan sosial memicu rangkaian peristiwa mengejutkan ketika keluarga Kim menyusup bekerja di rumah keluarga Park yang kaya raya.',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    ARRAY['Palme dOr', 'Oscar Best Picture', 'Shocking Twists'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222208',
    'The Glory',
    '11111111-1111-4111-8111-111111111101',
    'K-Drama',
    'Thriller / Drama / Revenge',
    2022,
    '16 Episodes (55m)',
    8.8,
    'Ahn Gil-ho',
    'Song Hye-kyo, Lee Do-hyun, Lim Ji-yeon, Jung Sung-il',
    'Netflix',
    'Bertahun-tahun setelah mengalami perundungan brutal di masa SMA, Moon Dong-eun menyusun rencana balas dendam yang rapi terhadap seluruh pelakunya.',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    ARRAY['Riveting', 'Psychological', 'Revenge'],
    FALSE
  ),
  (
    '22222222-2222-4222-8222-222222222209',
    'Your Name (Kimi no Na wa)',
    '11111111-1111-4111-8111-111111111103',
    'Anime',
    'Romance / Fantasy / Drama',
    2016,
    '106 mins',
    9.1,
    'Makoto Shinkai',
    'Ryunosuke Kamiki, Mone Kamishiraishi',
    'Netflix / Prime Video',
    'Dua remaja dari Tokyo dan desa pegunungan Jepang tiba-tiba bertukar tubuh secara misterius dan berusaha saling bertemu melintasi ruang serta waktu.',
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
    ARRAY['Visual Masterpiece', 'Time Travel', 'Emotional'],
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222210',
    'Dark',
    '11111111-1111-4111-8111-111111111104',
    'Series',
    'Sci-Fi / Mystery / Thriller',
    2017,
    '26 Episodes (55m)',
    9.3,
    'Baran bo Odar, Jantje Friese',
    'Louis Hofmann, Lisa Vicari, Andreas Pietschmann',
    'Netflix',
    'Hilangnya dua anak di kota kecil Winden menyingkap rahasia lintas generasi dan konspirasi perjalanan waktu yang menghubungkan empat keluarga.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    ARRAY['Time Loop', 'Genius Plot', 'German Series'],
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Marathons (5 Paket Marathon Terkurasi untuk Halaman Utama List #2)
INSERT INTO marathons (
  id, title, theme, mood, difficulty, total_duration, description,
  snack_recommendation, break_schedule, cover_url
) VALUES
  (
    '33333333-3333-4333-8333-333333333301',
    'Christopher Nolan Mind-Bending Night',
    'Sci-Fi & Historical Epic',
    'Serius & Kagum',
    'Menengah',
    '5 Jam 49 Menit',
    'Paket maraton dua mahakarya Christopher Nolan dengan sinematografi megah, skor musik intens, dan cerita ilmiah yang memicu diskusi panjang.',
    'Popcorn karamel, kopi hitam / es americano, air mineral dingin',
    'Istirahat 20 menit di antara film Interstellar dan Oppenheimer untuk peregangan.',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    'Weekend K-Drama Romance Overload',
    'Romantic K-Drama',
    'Baper & Romantis',
    'Hardcore',
    '38 Jam (2 Hari)',
    'Maraton dua drama Korea romantis paling fenomenal dengan chemistry pemeran luar biasa, komedi hangat, dan momen haru tak terlupakan.',
    'Ramyeon instan, tteokbokki, es teh manis, dan sekotak tisu!',
    'Jeda 10 menit setiap 2 episode dan tidur cukup setelah 8 episode per hari.',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    'Anime Healing & Visual Magic',
    'Fantasy Animation',
    'Santai & Nostalgia',
    'Santai',
    '3 Jam 51 Menit',
    'Sesi maraton ringan di malam minggu berisi dua film anime legendaris penuh keajaiban visual, musik menenangkan, dan pesan menyentuh hati.',
    'Matcha latte hangat, mochi, dan keripik kentang rumput laut',
    'Istirahat 15 menit setelah Spirited Away sebelum masuk ke Your Name.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    'Korean Thriller & Revenge Masterclass',
    'Thriller & Dark Satire',
    'Tegang & Penuh Plot Twist',
    'Menengah',
    '16 Jam 52 Menit',
    'Rangkaian tontonan Korea bertema kelas sosial, aksi mafia, dan balas dendam cerdas yang dijamin bikin susah berhenti di satu episode.',
    'Ayam goreng Korea pedas, soda lemon, dan kacang panggang',
    'Ambil jeda 15 menit setiap selesai film atau 3 episode agar fokus tetap tajam.',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80'
  ),
  (
    '33333333-3333-4333-8333-333333333305',
    'Time Travel & Paradox Expedition',
    'Time Paradox',
    'Mikir Keras & Penasaran',
    'Hardcore',
    '28 Jam 35 Menit',
    'Khusus penggemar teka-teki ruang dan waktu! Mulai dari Interstellar dan Your Name lalu lanjutkan dengan serial puzzle waktu terbaik sepanjang masa: Dark.',
    'Dark chocolate, teh hijau hangat, dan buku catatan untuk mencatat timeline',
    'Wajib istirahat 15 menit tiap 2 episode Dark agar tidak pusing mengikuti silsilah keluarga.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Relasi Marathon <-> Movies
INSERT INTO marathon_movies (marathon_id, movie_id, watch_order, note) VALUES
  -- Nolan Night
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222202', 1, 'Pembuka epik luar angkasa dengan audio terbaik'),
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222205', 2, 'Penutup drama sejarah intens peraih 7 Oscar'),
  -- K-Drama Romance
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222203', 1, 'Hari 1: Romansa ikonik lintas batas'),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201', 2, 'Hari 2: Emosi dan komedi rumah tangga chaebol'),
  -- Anime Healing
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222204', 1, 'Petualangan fantasi klasik Studio Ghibli'),
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222209', 2, 'Visual langit senja memukau karya Makoto Shinkai'),
  -- Korean Thriller
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222207', 1, 'Pemanasan 2 jam penuh plot twist tajam'),
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222208', 2, 'Maraton balas dendam psikologis yang memuaskan'),
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222206', 3, 'Penutup dark comedy mafia yang menghibur'),
  -- Time Paradox
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222202', 1, 'Pengantar konsep relativitas waktu'),
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222209', 2, 'Jeda romantis bertema anomali waktu'),
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222210', 3, 'Tantangan utama: 3 season misteri time loop')
ON CONFLICT (marathon_id, movie_id) DO NOTHING;

-- Seed Reviews
INSERT INTO reviews (id, movie_id, user_name, rating, comment) VALUES
  (
    '44444444-4444-4444-8444-444444444401',
    '22222222-2222-4222-8222-222222222201',
    'May Triastuti',
    5,
    'Chemistry Kim Soo-hyun dan Kim Ji-won luar biasa! Wajib masuk paket maraton akhir pekan.'
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    '22222222-2222-4222-8222-222222222202',
    'Cinephile99',
    5,
    'Karya legendaris Nolan. Musik Hans Zimmer saat adegan docking benar-benar merinding.'
  ),
  (
    '44444444-4444-4444-8444-444444444403',
    '22222222-2222-4222-8222-222222222207',
    'K-MovieFan',
    5,
    'Plot twist di ruang bawah tanah tidak terduga sama sekali. Layak menang Oscar Best Picture!'
  ),
  (
    '44444444-4444-4444-8444-444444444404',
    '22222222-2222-4222-8222-222222222210',
    'SciFiNerd',
    5,
    'Serial perjalanan waktu paling rapi penulisannya. Semua detail di season 1 terjawab di season 3.'
  )
ON CONFLICT (id) DO NOTHING;


-- 7. Tabel Genres & Relasi Movie_Genres (Halaman Filter Genre Film)
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#e5a93c',
  cover_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movie_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE (movie_id, genre_id)
);

ALTER TABLE genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres DISABLE ROW LEVEL SECURITY;

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

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m
JOIN genres g ON m.genre ILIKE '%' || g.name || '%'
ON CONFLICT (movie_id, genre_id) DO NOTHING;

UPDATE marathons SET difficulty = 'Collection' WHERE difficulty IN ('Santai', 'Menengah', 'Hardcore');


-- 8. Kolom Status Tayang ('Ongoing' / 'Tamat') pada tabel movies
ALTER TABLE movies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Tamat';
UPDATE movies SET status = 'Ongoing' WHERE title IN ('Queen of Tears', 'Oppenheimer', 'The Glory');
