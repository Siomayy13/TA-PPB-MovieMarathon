# Movie Marathon — Tugas Akhir Praktikum PPB (PWA + Custom Express API)

Aplikasi **Progressive Web App (PWA)** untuk Database Drama & Movie Populer serta Perencana Paket Marathon yang terhubung ke **RESTful API buatan sendiri** (Modul 1: Node.js + Express.js + Supabase PostgreSQL).

## Pemenuhan Ketentuan Tugas Akhir PPB

- **Platform:** Progressive Web App (React 19 + Vite + `vite-plugin-pwa` Workbox)
- **Custom RESTful API (Modul 1):** `MovieMarathon_API` (Express.js MVC: `config`, `models`, `controllers`, `routes`, `vercel.json`) dengan **database Supabase PostgreSQL baru**
- **Bottom Navigation Bar:** 5 tab utama persisten (`Film`, `Marathon`, `Watchlist`, `Panduan`, `Profil`)
- **Minimal 5 Halaman (Total 10 Halaman):**
  1. Katalog Film & Drama (`Catalog` — List Utama #1)
  2. Paket & Jadwal Marathon (`MarathonsPage` — List Utama #2)
  3. Daftar Watchlist (`WatchlistPage` — List #3)
  4. Panduan Marathon & Info Teknologi (`TipsPage`)
  5. Profil Pengembang & About Aplikasi (`ProfilePage`)
  6. Detail Film & Ulasan (`MovieDetail`)
  7. Detail Paket Marathon & Tracker Progres (`MarathonDetail`)
  8. Tambah Film Baru (`CreateMoviePage`)
  9. Ubah Data Film (`EditMoviePage`)
  10. Buat Paket Marathon Baru (`CreateMarathonPage`)
- **Minimal 2 Halaman Utama List -> Detail:**
  - `Catalog` (List Film/Drama) &rarr; klik item &rarr; `MovieDetail`
  - `MarathonsPage` (List Paket Marathon) &rarr; klik item &rarr; `MarathonDetail` (dan klik film di dalamnya &rarr; `MovieDetail`)
  - `WatchlistPage` (List Watchlist) &rarr; klik item &rarr; `MovieDetail`

## Konfigurasi & Menjalankan Lokal

1. Jalankan backend `MovieMarathon_API` di `http://localhost:3000`.
2. Pastikan `.env` di `MovieMarathon_PWA` berisi:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
3. Jalankan frontend:
   ```bash
   npm install
   npm run dev
   ```
