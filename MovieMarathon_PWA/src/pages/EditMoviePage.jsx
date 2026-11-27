import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Upload,
  Link2,
  X,
  Film,
  Loader,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import movieService from '../services/movieService'
import uploadService, { isValidImageUrl } from '../services/uploadService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

const POSTER_PRESETS = [
  {
    name: 'K-Drama Cinema',
    url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sci-Fi Cosmos',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Action & Noir',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Anime Aesthetic',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  },
]

export default function EditMoviePage({ movie, movieId, onBack, onSuccess }) {
  const targetId = movieId || movie?.id

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    type: 'Movie',
    genre: '',
    release_year: 2024,
    duration: '',
    rating: 8.5,
    director: '',
    cast: '',
    streaming_on: '',
    status: 'Tamat',
    featured: false,
    description: '',
    tags: '',
  })

  const [imagePreview, setImagePreview] = useState('')
  const [posterUrlInput, setPosterUrlInput] = useState('')
  const [posterSourceLabel, setPosterSourceLabel] = useState('Link URL')
  const [previewBroken, setPreviewBroken] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Draft modal
  const [showDraftModal, setShowDraftModal] = useState(() =>
    targetId ? hasDraft(`edit_${targetId}`) : false,
  )
  const [draftTimestamp, setDraftTimestamp] = useState(() =>
    targetId ? getDraftTimestamp(`edit_${targetId}`) : null,
  )

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true)
        setError('')
        let data = movie
        if (!data) {
          const res = await movieService.getMovieById(targetId)
          if (res.success && res.data) {
            data = res.data
          }
        }
        if (data) {
          setFormData({
            title: data.title || data.name || '',
            type: data.type || 'Movie',
            genre: data.genre || '',
            release_year: data.release_year || data.year || 2024,
            duration: data.duration || '',
            rating: data.rating ?? 0,
            director: data.director || '',
            cast: data.cast || data.cast_members || '',
            streaming_on: data.streaming_on || '',
            status: data.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
            featured: Boolean(data.featured),
            description: data.description || data.synopsis || '',
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          })
          const existingImg = data.image_url || data.image || ''
          setImagePreview(existingImg)
          if (existingImg.startsWith('http')) {
            setPosterUrlInput(existingImg)
            setPosterSourceLabel('Link URL')
          } else if (existingImg.startsWith('data:')) {
            setPosterUrlInput('')
            setPosterSourceLabel('File Lokal')
          }
          setPreviewBroken(false)
        } else {
          setError('Data film tidak ditemukan.')
        }
      } catch (err) {
        setError(err.message || 'Gagal mengambil data film.')
      } finally {
        setLoading(false)
      }
    }

    if (targetId) {
      fetchMovie()
    }
  }, [targetId, movie])

  const handleManualSaveDraft = () => {
    const draftData = { formData, imagePreview }
    const saved = saveDraft(draftData, `edit_${targetId}`)
    if (saved) {
      const ts = getDraftTimestamp(`edit_${targetId}`)
      setDraftTimestamp(ts)
      setSuccessMsg(`Perubahan tersimpan dalam draf (${formatDraftTime(ts)})`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleLoadDraft = () => {
    const draft = loadDraft(`edit_${targetId}`)
    if (draft) {
      if (draft.formData) setFormData(draft.formData)
      if (draft.imagePreview) {
        setImagePreview(draft.imagePreview)
        setPosterUrlInput(draft.imagePreview.startsWith('http') ? draft.imagePreview : '')
        setPosterSourceLabel(draft.imagePreview.startsWith('data:') ? 'File Lokal' : 'Link URL')
        setPreviewBroken(false)
      }
      setShowDraftModal(false)
      setSuccessMsg('Draf perubahan dipulihkan.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft(`edit_${targetId}`)
    setShowDraftModal(false)
    setDraftTimestamp(null)
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploading(true)
      setError('')
      const res = await uploadService.uploadImage(file)
      setImagePreview(res.data.url)
      setPosterUrlInput('')
      setPosterSourceLabel(`File Lokal (${file.name})`)
      setPreviewBroken(false)
      setSuccessMsg('Poster lokal diperbarui!')
      setTimeout(() => setSuccessMsg(''), 2500)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePosterUrlChange = (e) => {
    const val = e.target.value
    setPosterUrlInput(val)
    const trimmed = val.trim()
    if (trimmed && isValidImageUrl(trimmed)) {
      setImagePreview(trimmed)
      setPosterSourceLabel('Link URL')
      setPreviewBroken(false)
      setError('')
    }
  }

  const handleApplyUrl = () => {
    const trimmed = posterUrlInput.trim()
    if (!trimmed) {
      setError('Masukkan link URL gambar terlebih dahulu.')
      return
    }
    if (!isValidImageUrl(trimmed)) {
      setError('URL gambar harus diawali dengan http:// atau https://')
      return
    }
    setImagePreview(trimmed)
    setPosterSourceLabel('Link URL')
    setPreviewBroken(false)
    setError('')
    setSuccessMsg('Link poster diterapkan!')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const handleSelectPreset = (preset) => {
    setImagePreview(preset.url)
    setPosterUrlInput(preset.url)
    setPosterSourceLabel(`Preset (${preset.name})`)
    setPreviewBroken(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Judul film wajib diisi.')
      return
    }

    const finalImage =
      posterUrlInput.trim() && isValidImageUrl(posterUrlInput.trim())
        ? posterUrlInput.trim()
        : imagePreview

    if (posterUrlInput.trim() && !isValidImageUrl(posterUrlInput.trim())) {
      setError('Link URL poster tidak valid. Pastikan diawali http:// atau https://')
      return
    }

    const cleanTags = formData.tags
      ? formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const payload = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      type: formData.type,
      category: formData.type,
      genre: formData.genre.trim(),
      release_year: Number(formData.release_year) || 2024,
      year: Number(formData.release_year) || 2024,
      duration: formData.duration.trim(),
      rating: formData.rating !== '' && formData.rating !== null ? Number(formData.rating) : 0,
      director: formData.director.trim(),
      cast: formData.cast.trim(),
      streaming_on: formData.streaming_on.trim(),
      status: formData.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
      featured: Boolean(formData.featured),
      description: formData.description.trim(),
      synopsis: formData.description.trim(),
      image_url: finalImage,
      tags: cleanTags,
    }

    try {
      setUpdating(true)
      const res = await movieService.updateMovie(targetId, payload)
      if (res.success) {
        deleteDraft(`edit_${targetId}`)
        if (onSuccess) onSuccess(res.data)
        else if (onBack) onBack()
      } else {
        throw new Error('Gagal memperbarui data film.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="status-state">
        <Loader size={32} className="spin" />
        <p>Memuat data film untuk diedit...</p>
      </div>
    )
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <button type="button" className="detail-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={handleManualSaveDraft}
        >
          <Save size={15} /> Simpan Draf
        </button>
      </div>

      <div className="crud-title-group">
        <h1 className="crud-title">Ubah Informasi Film / Drama</h1>
        <p className="crud-subtitle">
          ID Dokumen: <code className="code-badge">{targetId}</code>
        </p>
      </div>

      {error && (
        <div className="toast-bar toast-bar--error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="toast-bar toast-bar--success">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="crud-form">
        {/* Poster */}
        <div className="form-card">
          <div className="poster-card-head">
            <div>
              <h2 className="form-card__title">Poster Film / Drama</h2>
              <p className="form-card__desc" style={{ marginBottom: 0 }}>
                Ganti poster lewat file lokal (komputer/HP), link URL gambar, atau preset.
              </p>
            </div>
            <span className="poster-source-badge">{posterSourceLabel}</span>
          </div>

          <div className="poster-picker-row" style={{ marginTop: '16px' }}>
            <div className="poster-preview-box">
              {imagePreview && !previewBroken ? (
                <img
                  src={imagePreview}
                  alt="Poster"
                  className="poster-preview-img"
                  onError={() => setPreviewBroken(true)}
                />
              ) : (
                <div className="poster-preview-empty">
                  <Film size={36} color="#8e9bb0" />
                  <span>{previewBroken ? 'Link gambar gagal dimuat' : 'Belum ada poster'}</span>
                </div>
              )}
            </div>

            <div className="poster-controls">
              {/* Opsi 1: Unggah Lokal */}
              <div className="poster-method-block">
                <span className="preset-label">1. Unggah dari Perangkat (Lokal):</span>
                <label htmlFor="edit-poster-file" className="btn btn--primary btn--sm file-upload-label">
                  <Upload size={16} />
                  <span>{uploading ? 'Mengompres...' : 'Ganti File dari Komputer / HP'}</span>
                  <input
                    id="edit-poster-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="hidden-input"
                  />
                </label>
              </div>

              {/* Opsi 2: Link URL Gambar */}
              <div className="poster-method-block">
                <label htmlFor="edit-poster-url" className="preset-label">
                  2. Atau Tempel Link URL Gambar:
                </label>
                <div className="url-input-row">
                  <div className="url-input-wrap">
                    <Link2 size={15} className="url-input-icon" />
                    <input
                      id="edit-poster-url"
                      type="url"
                      value={posterUrlInput}
                      onChange={handlePosterUrlChange}
                      placeholder="https://contoh.com/poster-film.jpg"
                      className="form-input url-input-field"
                    />
                    {posterUrlInput && (
                      <button
                        type="button"
                        className="url-clear-btn"
                        onClick={() => setPosterUrlInput('')}
                        aria-label="Hapus URL"
                        title="Kosongkan URL"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleApplyUrl}
                  >
                    Terapkan Link
                  </button>
                </div>
                {previewBroken && (
                  <span className="url-error-hint">
                    Gambar dari link tersebut tidak dapat ditampilkan. Pastikan URL mengarah langsung ke file gambar.
                  </span>
                )}
              </div>

              {/* Opsi 3: Preset Poster */}
              <div className="preset-group">
                <span className="preset-label">3. Atau gunakan preset poster:</span>
                <div className="preset-pills">
                  {POSTER_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pill ${imagePreview === p.url ? 'pill--active' : ''}`}
                      onClick={() => handleSelectPreset(p)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core fields */}
        <div className="form-card">
          <h2 className="form-card__title">Perbarui Data</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-title" className="form-label">
                Judul Film / Drama <span className="req">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-type" className="form-label">
                Kategori / Tipe <span className="req">*</span>
              </label>
              <select
                id="edit-type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="form-select"
              >
                <option value="K-Drama">K-Drama (Serial Korea)</option>
                <option value="Movie">Movie (Film Layar Lebar)</option>
                <option value="Anime">Anime (Jepang)</option>
                <option value="Series">Western / International Series</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid--3">
            <div className="form-field">
              <label htmlFor="edit-genre" className="form-label">
                Genre <span className="req">*</span>
              </label>
              <input
                id="edit-genre"
                type="text"
                name="genre"
                value={formData.genre}
                onChange={(e) => setFormData((p) => ({ ...p, genre: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-year" className="form-label">
                Tahun Rilis <span className="req">*</span>
              </label>
              <input
                id="edit-year"
                type="number"
                name="release_year"
                value={formData.release_year}
                onChange={(e) => setFormData((p) => ({ ...p, release_year: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-rating" className="form-label">
                Rating (0 - 10) <span className="req">*</span>
              </label>
              <input
                id="edit-rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                value={formData.rating}
                onChange={(e) => setFormData((p) => ({ ...p, rating: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-dur" className="form-label">
                Durasi / Episode
              </label>
              <input
                id="edit-dur"
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-stream" className="form-label">
                Platform Streaming
              </label>
              <input
                id="edit-stream"
                type="text"
                value={formData.streaming_on}
                onChange={(e) => setFormData((p) => ({ ...p, streaming_on: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-dir" className="form-label">
                Sutradara
              </label>
              <input
                id="edit-dir"
                type="text"
                value={formData.director}
                onChange={(e) => setFormData((p) => ({ ...p, director: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-cast" className="form-label">
                Pemeran
              </label>
              <input
                id="edit-cast"
                type="text"
                value={formData.cast}
                onChange={(e) => setFormData((p) => ({ ...p, cast: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-status" className="form-label">
                Status Tayang <span className="req">*</span>
              </label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="form-select"
              >
                <option value="Ongoing">Ongoing (Sedang Tayang / Baru Up)</option>
                <option value="Tamat">Tamat (Sudah Selesai)</option>
              </select>
            </div>

            <div className="form-field">
              <span className="form-label">Peringkat Trending (Otomatis)</span>
              <div className="checkbox-inline-box" style={{ cursor: 'default', opacity: 0.9 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--steel)' }}>
                  Top 10 Trending diperbarui otomatis berdasarkan rata-rata bintang &amp; ulasan
                  pengguna.
                </span>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="edit-desc" className="form-label">
              Sinopsis
            </label>
            <textarea
              id="edit-desc"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="form-textarea"
            />
          </div>

          <div className="form-field">
            <label htmlFor="edit-tags" className="form-label">
              Tag Marathon
            </label>
            <input
              id="edit-tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="crud-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack} disabled={updating}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={updating}>
            {updating ? (
              <>
                <Loader size={16} className="spin" /> Memperbarui...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDraftModal}
        title="Pulihkan Perubahan Belum Disimpan?"
        message={`Ditemukan draf edit tersimpan ${
          draftTimestamp ? formatDraftTime(draftTimestamp) : 'sebelumnya'
        }. Ingin memulihkan?`}
        confirmLabel="Pulihkan"
        cancelLabel="Buang"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  )
}
