# Movie Marathon RESTful API (Tugas Akhir PPB — Modul 1)

Backend RESTful Web Service yang dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase (PostgreSQL)** mengikuti struktur MVC-like Modul 1 Praktikum Pemrograman Perangkat Bergerak (PPB).

## Struktur Proyek

```
MovieMarathon_API/
├── database/
│   └── schema.sql                  # DDL 6 tabel relasional + Seed Data awal
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Konfigurasi koneksi Supabase via .env
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── movieController.js
│   │   ├── marathonController.js
│   │   ├── reviewController.js
│   │   └── watchlistController.js
│   ├── models/
│   │   ├── categoryModel.js
│   │   ├── movieModel.js
│   │   ├── marathonModel.js
│   │   ├── reviewModel.js
│   │   └── watchlistModel.js
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── marathonRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── watchlistRoutes.js
│   └── index.js                    # Entry point server Express.js
├── MovieMarathon_API_Postman_Collection.json
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## Daftar Endpoint

| Resource | Method | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| Health | `GET` | `/api/health` | Cek status API & konfigurasi database |
| Categories | `GET / POST / PUT / DELETE` | `/api/categories` | CRUD kategori tayangan |
| Movies | `GET / POST / PUT / DELETE` | `/api/movies` | CRUD film & drama (mendukung `?search=&type=`) |
| Marathons | `GET / POST / PUT / DELETE` | `/api/marathons` | CRUD paket marathon beserta relasi film |
| Reviews | `GET / POST / DELETE` | `/api/reviews` & `/api/reviews/movie/:movieId` | Ulasan & rating penonton |
| Watchlist | `GET / POST / DELETE` | `/api/watchlist` & `/api/watchlist/toggle` | Simpan / hapus watchlist per pengguna |

## Cara Menjalankan Lokal

1. Buat project Supabase **baru** di https://supabase.com lalu jalankan isi file `database/schema.sql` di **SQL Editor**.
2. Salin **Project URL** dan **anon public key** ke file `.env`:
   ```env
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=eyJhbGci...
   PORT=3000
   ```
3. Install dependensi dan jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Buka `http://localhost:3000` atau import `MovieMarathon_API_Postman_Collection.json` ke Postman.
