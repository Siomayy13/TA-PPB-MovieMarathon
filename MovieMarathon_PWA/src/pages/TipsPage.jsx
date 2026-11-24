import { Film, CheckCircle, Wifi, Download, Coffee, Popcorn, Bookmark } from 'lucide-react'

export default function TipsPage() {
  return (
    <div className="tips-page">
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <Popcorn size={14} color="#e5a93c" />
            <span>Tips &amp; Panduan Marathon</span>
          </div>
          <h1 className="masthead-title">Panduan Movie Marathon</h1>
          <p className="masthead-desc">
            Panduan praktis memaksimalkan pengalaman binge-watching Anda agar tetap nyaman, sehat,
            dan terorganisir di perangkat mobile maupun desktop.
          </p>
        </div>
      </section>

      <div className="tips-grid">
        <div className="tip-card">
          <div className="tip-card__icon">
            <Wifi size={24} color="#27ae60" />
          </div>
          <h3 className="tip-card__title">Tetap Lancar Saat Offline</h3>
          <p className="tip-card__desc">
            Katalog film, paket marathon, dan daftar watchlist Anda tersimpan otomatis di perangkat
            sehingga tetap bisa diakses kapan saja meski koneksi internet sedang tidak stabil.
          </p>
        </div>

        <div className="tip-card">
          <div className="tip-card__icon">
            <Download size={24} color="#e5a93c" />
          </div>
          <h3 className="tip-card__title">Pasang di Smartphone / Laptop</h3>
          <p className="tip-card__desc">
            Klik tombol <strong>&ldquo;Install Sekarang&rdquo;</strong> pada banner atau pilih menu
            browser (<em>&ldquo;Add to Home Screen&rdquo;</em>) agar Movie Marathon bisa dibuka
            langsung dari layar utama tanpa address bar.
          </p>
        </div>

        <div className="tip-card">
          <div className="tip-card__icon">
            <Coffee size={24} color="#ff7b25" />
          </div>
          <h3 className="tip-card__title">Aturan Marathon Sehat</h3>
          <p className="tip-card__desc">
            Ambil jeda istirahat 10&ndash;15 menit setiap 2 episode drama atau 1 film panjang. Cek
            tab <strong>Marathon</strong> untuk rekomendasi camilan dan jadwal istirahat di setiap
            paket.
          </p>
        </div>

        <div className="tip-card">
          <div className="tip-card__icon">
            <Bookmark size={24} color="#3498db" />
          </div>
          <h3 className="tip-card__title">Kelola Antrean di Watchlist</h3>
          <p className="tip-card__desc">
            Gunakan tombol bookmark pada setiap kartu film atau drama untuk menyimpan tontonan
            incaran Anda dan tandai progres tontonan di setiap paket marathon.
          </p>
        </div>
      </div>

      <div className="form-card" style={{ marginTop: '28px' }}>
        <h2 className="form-card__title">Fitur Utama Movie Marathon</h2>
        <ul className="tech-list">
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Katalog Film &amp; Drama Lengkap:</strong> Pencarian cepat, filter kategori
              (Movie, K-Drama, Anime, Series), serta pengurutan berdasarkan rating, tahun, dan judul.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Paket Marathon Terkurasi:</strong> Rekomendasi rangkaian tontonan lengkap
              dengan urutan, estimasi durasi, camilan, dan checklist progres.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Ulasan &amp; Watchlist Komunitas:</strong> Tulis rating serta ulasan film
              favorit Anda dan simpan antrean tontonan dalam satu klik.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Kontribusi Judul Baru:</strong> Tambahkan atau perbarui data film, drama, dan
              paket marathon dengan dukungan unggah poster lokal maupun link URL.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
