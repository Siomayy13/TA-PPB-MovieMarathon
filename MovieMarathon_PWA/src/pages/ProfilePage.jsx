import { useState, useEffect } from 'react'
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
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Plus,
  Compass,
  AlertCircle,
  Loader,
  Edit2,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import uploadService from '../services/uploadService'
import { useWatchlist } from '../hooks/useWatchlist'
import { useMovies } from '../hooks/useMovies'
import { useMarathons } from '../hooks/useMarathons'
import { checkApiHealth } from '../config/api'

export default function ProfilePage({ onReplaySplash, onNavigate, onOpenTips }) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    updateProfile,
    requestLogout,
    openAuthModal,
  } = useAuth()

  // Modal Edit Profil state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favorite_genre || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [feedback, setFeedback] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [apiCheckStatus, setApiCheckStatus] = useState(null)
  const [checkingApi, setCheckingApi] = useState(false)

  const { watchlistCount } = useWatchlist()
  const { movies, source: movieSource } = useMovies()
  const { marathons } = useMarathons()

  useEffect(() => {
    setDisplayName(user?.display_name || '')
    setFavoriteGenre(user?.favorite_genre || '')
    setBio(user?.bio || '')
    setAvatarUrl(user?.avatar_url || '')
  }, [user])

  const openEditProfileModal = () => {
    setDisplayName(user?.display_name || '')
    setFavoriteGenre(user?.favorite_genre || '')
    setBio(user?.bio || '')
    setAvatarUrl(user?.avatar_url || '')
    setModalError('')
    setEditModalOpen(true)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingAvatar(true)
      setModalError('')
      const res = await uploadService.uploadImage(file)
      setAvatarUrl(res.data.url)
    } catch (err) {
      setModalError(err.message || 'Gagal memproses foto profil.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setModalError('')
    setErrorMsg('')
    setFeedback('')
    if (!displayName.trim()) {
      setModalError('Nama tampilan wajib diisi.')
      return
    }
    try {
      setSaving(true)
      await updateProfile({
        display_name: displayName.trim(),
        favorite_genre: favoriteGenre.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      })
      setEditModalOpen(false)
      setFeedback('Perubahan profil berhasil disimpan permanen ke database!')
      setTimeout(() => setFeedback(''), 3500)
    } catch (err) {
      setModalError(err?.message || 'Gagal menyimpan profil ke database.')
    } finally {
      setSaving(false)
    }
  }

  const handleCheckApi = async () => {
    setCheckingApi(true)
    try {
      const res = await checkApiHealth()
      setApiCheckStatus({
        ok: res.ok,
        message: res.ok
          ? `Server aktif — terhubung ke database (${res.data?.status || 'ok'})`
          : 'Server belum merespons. Aplikasi berjalan dalam mode cache offline.',
      })
    } finally {
      setCheckingApi(false)
    }
  }

  return (
    <div className="profile-page">
      {/* Masthead */}
      <section className="catalog-masthead">
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
            <h1 className="masthead-title">
              {isAuthenticated
                ? isAdmin
                  ? 'Dashboard & Profil Admin'
                  : 'Profil Akun Saya'
                : 'Akun & Tentang Aplikasi'}
            </h1>
            <p className="masthead-desc">
              {isAuthenticated
                ? isAdmin
                  ? 'Kelola katalog film, collections, genre, serta pengaturan akun administrator Anda.'
                  : 'Lihat dan perbarui informasi profil pribadi Anda yang tersimpan permanen di database.'
                : 'Anda sedang menjelajah dalam mode tamu (belum login). Masuk untuk menyimpan profil, watchlist, ulasan, dan histori tontonan.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onOpenTips && (
              <button type="button" className="btn btn--outline btn--sm" onClick={onOpenTips}>
                <Compass size={15} /> Panduan Marathon
              </button>
            )}
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
        </div>
      </section>

      {feedback && (
        <div className="toast-bar toast-bar--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="toast-bar toast-bar--error">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* BELUM LOGIN: Status Tamu + Tombol Login/Daftar */}
      {!isAuthenticated ? (
        <div className="student-profile-card guest-profile-card">
          <div className="student-card__top">
            <div className="student-avatar-wrap">
              <div className="student-avatar-placeholder">
                <User size={40} color="#8e9bb0" />
              </div>
            </div>

            <div className="student-main-info" style={{ flex: 1 }}>
              <div className="badge-identity">
                <Sparkles size={13} color="#8e9bb0" />
                <span>Status: Belum Login (Mode Tamu)</span>
              </div>
              <h2 className="student-name">Selamat Datang, Pengunjung</h2>
              <p className="student-bio" style={{ fontStyle: 'normal' }}>
                Anda tetap dapat melihat seluruh katalog film, genre, collections, dan memutar
                preview video episode. Login atau daftar akun untuk membuka{' '}
                <strong>Histori Tontonan</strong>, <strong>Watchlist Pribadi</strong>,{' '}
                <strong>Ulasan Bintang</strong>, serta penyimpanan profil permanen.
              </p>

              <div
                className="auth-lock-actions"
                style={{ justifyContent: 'flex-start', marginTop: '14px' }}
              >
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => openAuthModal('login')}
                >
                  <LogIn size={16} /> Masuk ke Akun
                </button>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => openAuthModal('register')}
                >
                  <UserPlus size={16} /> Daftar Akun Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* SUDAH LOGIN: Kartu Informasi Profil */}
          <div className="student-profile-card">
            <div className="student-card__top">
              <div className="student-avatar-wrap">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="student-avatar-img"
                  />
                ) : (
                  <div className="student-avatar-placeholder">
                    {isAdmin ? (
                      <Shield size={38} color="#e5a93c" />
                    ) : (
                      <User size={40} color="#e5a93c" />
                    )}
                  </div>
                )}
              </div>

              <div className="student-main-info" style={{ flex: 1 }}>
                <div className="badge-identity">
                  {isAdmin ? (
                    <>
                      <Shield size={13} color="#e5a93c" />
                      <span>Administrator Movie Marathon</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} color="#38bdf8" />
                      <span>Akun Pengguna Terdaftar</span>
                    </>
                  )}
                </div>

                <h2 className="student-name">{user.display_name}</h2>
                <p className="profile-email-text">{user.email}</p>

                <div className="student-tags">
                  <span className={`role-chip ${isAdmin ? 'role-chip--admin' : 'role-chip--user'}`}>
                    Role: {isAdmin ? 'Admin' : 'Pengguna'}
                  </span>
                  <span className="student-tag">
                    <Heart size={14} color="#e5a93c" />
                    <strong>Genre Favorit:</strong>{' '}
                    {user.favorite_genre || 'Belum ditentukan'}
                  </span>
                </div>

                <p className="student-bio">
                  {user.bio
                    ? `“${user.bio}”`
                    : 'Belum ada bio singkat. Klik "Edit Profil" untuk menambahkan bio Anda.'}
                </p>
              </div>
            </div>

            {/* Statistik Katalog HANYA Tampil untuk Role Admin */}
            {isAdmin && (
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
                  <div className="student-stat-val">
                    {movieSource === 'api' ? 'ONLINE' : 'OFFLINE'}
                  </div>
                  <div className="student-stat-label">Status Koneksi</div>
                </div>
              </div>
            )}

            {/* Dua Tombol Utama di Bagian Bawah Kartu Profil: Edit Profil & Log Out */}
            <div className="profile-card-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={openEditProfileModal}
              >
                <Edit2 size={16} /> Edit Profil
              </button>
              <button
                type="button"
                className="btn btn--danger-outline"
                onClick={requestLogout}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>

          {/* PANEL KONTROL ADMIN (Khusus Role Admin — Tanpa Daftar Akun Terdaftar) */}
          {isAdmin && (
            <div className="form-card admin-panel-card" style={{ marginTop: '24px' }}>
              <div className="about-head">
                <div className="about-icon-badge">
                  <Shield size={20} color="#e5a93c" />
                </div>
                <div>
                  <h2 className="form-card__title" style={{ marginBottom: '2px' }}>
                    Panel Kontrol Admin
                  </h2>
                  <p className="form-card__desc" style={{ margin: 0 }}>
                    Kelola katalog film, episode video, collections, dan daftar genre dengan cepat.
                  </p>
                </div>
              </div>

              <div className="admin-quick-actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onNavigate && onNavigate('Create')}
                >
                  <Plus size={15} /> Tambah Film Baru
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => onNavigate && onNavigate('CreateMarathon')}
                >
                  <Layers size={15} /> Buat Collection Baru
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => onNavigate && onNavigate('Marathons')}
                >
                  Kelola &amp; Edit Collections
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => onNavigate && onNavigate('Genres')}
                >
                  Kelola Genre
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pop-up Modal Edit Profil (Tersimpan Permanen ke Database) */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => !saving && setEditModalOpen(false)}>
          <div
            className="modal-box auth-modal edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal__header">
              <div>
                <h2 id="edit-profile-modal-title" className="modal-title">
                  Edit Profil
                </h2>
                <p className="auth-modal__sub">
                  Perubahan foto avatar, nama tampilan, genre favorit, dan bio akan disimpan
                  permanen ke database.
                </p>
              </div>
              <button
                type="button"
                className="pwa-toast__close"
                onClick={() => !saving && setEditModalOpen(false)}
                aria-label="Tutup dialog edit profil"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="toast-bar toast-bar--error" style={{ marginBottom: 0 }}>
                <AlertCircle size={16} /> <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="auth-form">
              {/* Avatar Upload Preview */}
              <div className="edit-profile-avatar-row">
                <div className="student-avatar-wrap" style={{ width: '76px', height: '76px' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview Avatar" className="student-avatar-img" />
                  ) : (
                    <div className="student-avatar-placeholder">
                      <User size={32} color="#e5a93c" />
                    </div>
                  )}
                </div>
                <div className="edit-profile-avatar-controls">
                  <label
                    htmlFor="modal-avatar-input"
                    className="btn btn--outline btn--sm file-upload-label"
                  >
                    <Camera size={14} />
                    <span>{uploadingAvatar ? 'Memproses...' : 'Ganti Foto Avatar'}</span>
                    <input
                      id="modal-avatar-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden-input"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => setAvatarUrl('')}
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="modal-display-name" className="form-label">
                  Nama Tampilan <span className="req">*</span>
                </label>
                <input
                  id="modal-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="misal: May Triastuti"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="modal-fav-genre" className="form-label">
                  Genre Favorit
                </label>
                <input
                  id="modal-fav-genre"
                  type="text"
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  placeholder="misal: K-Drama, Romance, Sci-Fi"
                  className="form-input"
                />
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="modal-bio" className="form-label">
                  Bio Singkat
                </label>
                <textarea
                  id="modal-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan film atau drama favorit Anda..."
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setEditModalOpen(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader size={15} className="spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Versi 2.2.0 &bull; Katalog Drama, Film, Episode &amp; Collections
            </p>
          </div>
        </div>

        <p className="about-paragraph">
          <strong>Movie Marathon</strong> adalah platform direktori film, drama Korea, anime, dan
          serial populer lengkap dengan peringkat Trending otomatis berbasis ulasan komunitas,
          preview video episode, koleksi terkurasi, watchlist pribadi, dan histori tontonan
          otomatis maupun manual.
        </p>

        <ul className="tech-list" style={{ marginBottom: '18px' }}>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Trending Top 10 Otomatis:</strong> Diperingkatkan secara dinamis berdasarkan
              rata-rata bintang dan jumlah ulasan pengguna.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Daftar Episode &amp; Preview Video:</strong> Tonton pratinjau episode berbasis
              tautan eksternal langsung dari halaman detail film.
            </span>
          </li>
          <li>
            <CheckCircle size={16} color="#27ae60" />
            <span>
              <strong>Histori Tontonan &amp; Akun:</strong> Pencatatan otomatis saat episode selesai
              ditonton serta pengeditan progres manual untuk pengguna terdaftar.
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
    </div>
  )
}
