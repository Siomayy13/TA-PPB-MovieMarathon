import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  Loader,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ open, initialMode = 'login', onClose }) {
  const { login, register } = useAuth()

  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setMode(initialMode || 'login')
      setShowPassword(false)
      setError('')
    }
  }, [open, initialMode])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setSubmitting(true)
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({
          email,
          password,
          display_name: displayName,
          favorite_genre: favoriteGenre,
        })
      }
      setEmail('')
      setPassword('')
      setDisplayName('')
      setFavoriteGenre('')
      if (onClose) onClose()
    } catch (err) {
      setError(err?.message || 'Proses autentikasi gagal. Periksa kembali data Anda.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal__header">
          <div>
            <h2 id="auth-modal-title" className="modal-title">
              {mode === 'login' ? 'Masuk ke Movie Marathon' : 'Daftar Akun Baru'}
            </h2>
            <p className="auth-modal__sub">
              {mode === 'login'
                ? 'Simpan profil, histori tontonan, ulasan, dan watchlist permanen ke akun Anda.'
                : 'Buat akun pengguna gratis untuk mengakses histori tontonan dan fitur pribadi.'}
            </p>
          </div>
          <button
            type="button"
            className="pwa-toast__close"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            <LogIn size={15} /> Masuk
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            <UserPlus size={15} /> Daftar Akun
          </button>
        </div>

        {error && (
          <div className="toast-bar toast-bar--error" style={{ marginBottom: '4px' }}>
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="auth-name" className="form-label">
                Nama Tampilan <span className="req">*</span>
              </label>
              <div className="url-input-wrap">
                <User size={15} className="url-input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  className="form-input url-input-field"
                  placeholder="misal: May Triastuti"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="auth-email" className="form-label">
              Email <span className="req">*</span>
            </label>
            <div className="url-input-wrap">
              <Mail size={15} className="url-input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input url-input-field"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="auth-pass" className="form-label">
              Kata Sandi <span className="req">*</span>
            </label>
            <div className="url-input-wrap">
              <Lock size={15} className="url-input-icon" />
              <input
                id="auth-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input url-input-field password-input-field"
                placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="auth-genre" className="form-label">
                Genre Favorit (Opsional)
              </label>
              <input
                id="auth-genre"
                type="text"
                className="form-input"
                placeholder="misal: Sci-Fi, K-Drama, Thriller"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader size={16} className="spin" /> Memproses...
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} /> Masuk Sekarang
              </>
            ) : (
              <>
                <UserPlus size={16} /> Buat Akun
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
