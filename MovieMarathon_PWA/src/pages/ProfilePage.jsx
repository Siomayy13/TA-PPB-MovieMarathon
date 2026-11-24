import { useState } from 'react'
import {
  User,
  Heart,
  Bookmark,
  Film,
  Layers,
  Camera,
  Save,
  Check,
  Play,
  Info,
  Server,
  Sparkles,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import userService from '../services/userService'
import { useWatchlist } from '../hooks/useWatchlist'
import { useMovies } from '../hooks/useMovies'
import { useMarathons } from '../hooks/useMarathons'
import { checkApiHealth } from '../config/api'

export default function ProfilePage({ onReplaySplash }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())

  const [nama, setNama] = useState(profile.nama || 'May Triastuti')
  const [favoriteGenre, setFavoriteGenre] = useState(profile.favoriteGenre || 'Sci-Fi & K-Drama')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)

  const [feedback, setFeedback] = useState('')
  const [apiCheckStatus, setApiCheckStatus] = useState(null)
  const [checkingApi, setCheckingApi] = useState(false)

  const { watchlistCount } = useWatchlist()
  const { movies, source: movieSource } = useMovies()
  const { marathons } = useMarathons()

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Ukuran foto profil maksimal 2MB.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      setFeedback('Foto profil diperbarui! Klik Simpan untuk menyimpan permanen.')
      setTimeout(() => setFeedback(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updated = {
      ...profile,
      nama: nama.trim() || 'May Triastuti',
      favoriteGenre: favoriteGenre.trim(),
      bio: bio.trim(),
      avatar,
    }

    const res = userService.saveUserProfile(updated)
    if (res.success) {
      setProfile(res.data)
      setFeedback('Profil berhasil diperbarui!')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleCheckApi = async () => {
    setCheckingApi(true)
    const status = await checkApiHealth()
    setApiCheckStatus(status)
    setCheckingApi(false)
  }

  return (
    <div className="profile-page">
      {/* Header section */}
      <section className="catalog-masthead" style={{ paddingBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div className="masthead-content">
            <div className="masthead-badge">
              <User size={14} color="#e5a93c" />
              <span>Profil &amp; Tentang Aplikasi</span>
            </div>
            <h1 className="masthead-title">Profil Saya</h1>
            <p className="masthead-desc">
              Kelola profil penonton, pantau statistik tontonan, dan lihat informasi seputar
              aplikasi Movie Marathon.
            </p>
          </div>

          {onReplaySplash && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onReplaySplash}
              title="Putar ulang animasi intro"
            >
              <Play size={15} /> Putar Ulang Intro
            </button>
          )}
        </div>
      </section>

      {feedback && (
        <div className="toast-bar toast-bar--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Main User Card */}
      <div className="student-profile-card">
        <div className="student-card__top">
          <div className="student-avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.nama} className="student-avatar-img" />
            ) : (
              <div className="student-avatar-placeholder">
                <User size={40} color="#e5a93c" />
              </div>
            )}
            <label htmlFor="avatar-input" className="student-avatar-edit-btn" title="Ganti Foto">
              <Camera size={14} />
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden-input"
              />
            </label>
          </div>

          <div className="student-main-info">
            <div className="badge-identity">
              <Sparkles size={13} color="#e5a93c" />
              <span>Movie Enthusiast</span>
            </div>
            <h2 className="student-name">{profile.nama}</h2>

            {profile.favoriteGenre && (
              <div className="student-tags">
                <span className="student-tag">
                  <Heart size={14} color="#e5a93c" />
                  <strong>Genre Favorit:</strong> {profile.favoriteGenre}
                </span>
              </div>
            )}

            {profile.bio && <p className="student-bio">&ldquo;{profile.bio}&rdquo;</p>}
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="student-stats-grid student-stats-grid--4">
          <div className="student-stat-item">
            <Film size={22} color="#e5a93c" />
            <div className="student-stat-val">{movies.length}</div>
            <div className="student-stat-label">Judul Film &amp; Drama</div>
          </div>
          <div className="student-stat-item">
            <Layers size={22} color="#e5a93c" />
            <div className="student-stat-val">{marathons.length}</div>
            <div className="student-stat-label">Collections</div>
          </div>
          <div className="student-stat-item">
            <Bookmark size={22} color="#e5a93c" />
            <div className="student-stat-val">{watchlistCount}</div>
            <div className="student-stat-label">Watchlist Saya</div>
          </div>
          <div className="student-stat-item">
            {movieSource === 'api' ? (
              <Wifi size={22} color="#27ae60" />
            ) : (
              <WifiOff size={22} color="#e5a93c" />
            )}
            <div className="student-stat-val">{movieSource === 'api' ? 'ONLINE' : 'OFFLINE'}</div>
            <div className="student-stat-label">Status Koneksi</div>
          </div>
        </div>
      </div>

      {/* About Application Section */}
      <div className="form-card" style={{ marginTop: '24px' }}>
        <div className="about-head">
          <div className="about-icon-badge">
            <Info size={20} color="#e5a93c" />
          </div>
          <div>
            <h2 className="form-card__title" style={{ marginBottom: '2px' }}>
              Tentang Movie Marathon
            </h2>
            <p className="form-card__desc" style={{ margin: 0 }}>
              Versi 2.0.0 &bull; Katalog Drama, Film &amp; Perencana Binge-Watching
            </p>
          </div>
        </div>

        <p className="about-paragraph">
          <strong>Movie Marathon</strong> adalah platform direktori film, drama Korea, anime, dan
          serial populer yang membantu Anda menemukan tontonan terbaik sekaligus menyusun sesi{' '}
          <em>binge-watching</em> secara terarah. Dilengkapi dengan daftar paket maraton terkurasi,
          pelacak progres tontonan, watchlist pribadi, ulasan komunitas, serta dukungan mode
          offline.
        </p>

        <ul className="tech-list" style={{ marginBottom: '18px' }}>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Katalog &amp; Detail Lengkap:</strong> Cari, filter kategori, dan urutkan
              film berdasarkan rating, tahun rilis, atau judul.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Paket Marathon &amp; Progres:</strong> Rencana tontonan berurutan lengkap
              dengan rekomendasi camilan, jadwal istirahat, dan checklist.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Sinkronisasi Cloud &amp; Offline:</strong> Data tersinkronisasi dengan server
              dan tetap dapat diakses saat perangkat offline.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Dikembangkan oleh:</strong> May Triastuti
            </span>
          </li>
        </ul>

        {/* Server Status Box */}
        <div className="api-status-box">
          <div className="api-status-box__info">
            <Server size={16} color="#e5a93c" />
            <div>
              <div className="api-status-label">Status Layanan Server</div>
              <span style={{ fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 600 }}>
                {movieSource === 'api'
                  ? 'Terhubung ke server secara real-time'
                  : 'Berjalan dalam mode cache offline'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleCheckApi}
            disabled={checkingApi}
          >
            <RefreshCw size={14} className={checkingApi ? 'spin' : ''} />
            <span>{checkingApi ? 'Mengecek...' : 'Cek Koneksi'}</span>
          </button>
        </div>

        {apiCheckStatus && (
          <div
            className={`toast-bar ${apiCheckStatus.ok ? 'toast-bar--success' : 'toast-bar--error'}`}
            style={{ marginTop: '12px', marginBottom: 0 }}
          >
            {apiCheckStatus.ok ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{apiCheckStatus.message}</span>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      <div className="form-card" style={{ marginTop: '24px' }}>
        <h2 className="form-card__title">Pengaturan Profil</h2>
        <p className="form-card__desc">
          Sesuaikan nama tampilan, genre favorit, dan bio profil Anda.
        </p>

        <form onSubmit={handleSaveProfile} className="student-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="student-nama" className="form-label">
                Nama Tampilan <span className="req">*</span>
              </label>
              <input
                id="student-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="misal: May Triastuti"
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="student-fav" className="form-label">
                Genre Favorit
              </label>
              <input
                id="student-fav"
                type="text"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                placeholder="misal: K-Drama, Romance, Sci-Fi"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="student-bio" className="form-label">
              Bio Singkat
            </label>
            <textarea
              id="student-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan film atau drama favorit Anda..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn--primary">
              <Save size={16} /> Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
