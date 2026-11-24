import { DEFAULT_MOVIES } from './movies'

const movieById = (id, watchOrder, note) => {
  const m = DEFAULT_MOVIES.find((item) => item.id === id)
  return m ? { ...m, watch_order: watchOrder, note } : null
}

/**
 * Default Seed Paket Marathon (Halaman Utama List #2)
 * Selaras dengan database/schema.sql pada MovieMarathon_API.
 */
export const DEFAULT_MARATHONS = [
  {
    id: '33333333-3333-4333-8333-333333333301',
    title: 'Christopher Nolan Mind-Bending Night',
    theme: 'Sci-Fi & Historical Epic',
    mood: 'Serius & Kagum',
    difficulty: 'Menengah',
    total_duration: '5 Jam 49 Menit',
    description:
      'Paket maraton dua mahakarya Christopher Nolan dengan sinematografi megah, skor musik intens, dan cerita ilmiah yang memicu diskusi panjang.',
    snack_recommendation: 'Popcorn karamel, kopi hitam / es americano, air mineral dingin',
    break_schedule:
      'Istirahat 20 menit di antara film Interstellar dan Oppenheimer untuk peregangan.',
    cover_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    movies: [
      movieById(
        '22222222-2222-4222-8222-222222222202',
        1,
        'Pembuka epik luar angkasa dengan audio terbaik',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222205',
        2,
        'Penutup drama sejarah intens peraih 7 Oscar',
      ),
    ].filter(Boolean),
  },
  {
    id: '33333333-3333-4333-8333-333333333302',
    title: 'Weekend K-Drama Romance Overload',
    theme: 'Romantic K-Drama',
    mood: 'Baper & Romantis',
    difficulty: 'Hardcore',
    total_duration: '38 Jam (2 Hari)',
    description:
      'Maraton dua drama Korea romantis paling fenomenal dengan chemistry pemeran luar biasa, komedi hangat, dan momen haru tak terlupakan.',
    snack_recommendation: 'Ramyeon instan, tteokbokki, es teh manis, dan sekotak tisu!',
    break_schedule:
      'Jeda 10 menit setiap 2 episode dan tidur cukup setelah 8 episode per hari.',
    cover_url:
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80',
    movies: [
      movieById(
        '22222222-2222-4222-8222-222222222203',
        1,
        'Hari 1: Romansa ikonik lintas batas',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222201',
        2,
        'Hari 2: Emosi dan komedi rumah tangga chaebol',
      ),
    ].filter(Boolean),
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    title: 'Anime Healing & Visual Magic',
    theme: 'Fantasy Animation',
    mood: 'Santai & Nostalgia',
    difficulty: 'Santai',
    total_duration: '3 Jam 51 Menit',
    description:
      'Sesi maraton ringan di malam minggu berisi dua film anime legendaris penuh keajaiban visual, musik menenangkan, dan pesan menyentuh hati.',
    snack_recommendation: 'Matcha latte hangat, mochi, dan keripik kentang rumput laut',
    break_schedule:
      'Istirahat 15 menit setelah Spirited Away sebelum masuk ke Your Name.',
    cover_url:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    movies: [
      movieById(
        '22222222-2222-4222-8222-222222222204',
        1,
        'Petualangan fantasi klasik Studio Ghibli',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222209',
        2,
        'Visual langit senja memukau karya Makoto Shinkai',
      ),
    ].filter(Boolean),
  },
  {
    id: '33333333-3333-4333-8333-333333333304',
    title: 'Korean Thriller & Revenge Masterclass',
    theme: 'Thriller & Dark Satire',
    mood: 'Tegang & Penuh Plot Twist',
    difficulty: 'Menengah',
    total_duration: '16 Jam 52 Menit',
    description:
      'Rangkaian tontonan Korea bertema kelas sosial, aksi mafia, dan balas dendam cerdas yang dijamin bikin susah berhenti di satu episode.',
    snack_recommendation: 'Ayam goreng Korea pedas, soda lemon, dan kacang panggang',
    break_schedule:
      'Ambil jeda 15 menit setiap selesai film atau 3 episode agar fokus tetap tajam.',
    cover_url:
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    movies: [
      movieById(
        '22222222-2222-4222-8222-222222222207',
        1,
        'Pemanasan 2 jam penuh plot twist tajam',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222208',
        2,
        'Maraton balas dendam psikologis yang memuaskan',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222206',
        3,
        'Penutup dark comedy mafia yang menghibur',
      ),
    ].filter(Boolean),
  },
  {
    id: '33333333-3333-4333-8333-333333333305',
    title: 'Time Travel & Paradox Expedition',
    theme: 'Time Paradox',
    mood: 'Mikir Keras & Penasaran',
    difficulty: 'Hardcore',
    total_duration: '28 Jam 35 Menit',
    description:
      'Khusus penggemar teka-teki ruang dan waktu! Mulai dari Interstellar dan Your Name lalu lanjutkan dengan serial puzzle waktu terbaik sepanjang masa: Dark.',
    snack_recommendation:
      'Dark chocolate, teh hijau hangat, dan buku catatan untuk mencatat timeline',
    break_schedule:
      'Wajib istirahat 15 menit tiap 2 episode Dark agar tidak pusing mengikuti silsilah keluarga.',
    cover_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    movies: [
      movieById(
        '22222222-2222-4222-8222-222222222202',
        1,
        'Pengantar konsep relativitas waktu',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222209',
        2,
        'Jeda romantis bertema anomali waktu',
      ),
      movieById(
        '22222222-2222-4222-8222-222222222210',
        3,
        'Tantangan utama: 3 season misteri time loop',
      ),
    ].filter(Boolean),
  },
]

export default DEFAULT_MARATHONS
