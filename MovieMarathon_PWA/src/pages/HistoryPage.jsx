import { useState, useEffect, useMemo } from 'react'
import {
  History,
  Lock,
  LogIn,
  UserPlus,
  Loader,
  Film,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Save,
  X,
  ArrowRight,
  Star,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLazyList } from '../hooks/useLazyList'
import LazyImage from '../components/common/LazyImage'
import historyService from '../services/historyService'
import ConfirmModal from '../components/modals/ConfirmModal'
import { formatRating } from '../utils/helpers'

const STATUS_FILTERS = ['Semua', 'Sedang Ditonton', 'Selesai', 'Ditonton Ulang']

export default function HistoryPage({ onSelectMovie, onNavigateCatalog }) {
  const { isAuthenticated, user, openAuthModal } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [feedback, setFeedback] = useState('')

  // Manual Edit modal state
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    watch_status: 'Selesai',
    last_episode_number: 1,
    total_episodes: 1,
    progress_percent: 100,
    watch_count: 1,
    notes: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadHistory = async () => {
    if (!isAuthenticated) {
      setItems([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await historyService.getHistory()
      if (res.success) {
        setItems(res.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    const onUpdated = () => loadHistory()
    window.addEventListener('history-updated', onUpdated)
    return () => window.removeEventListener('history-updated', onUpdated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'Semua') return items
    return items.filter((item) => item.watch_status === activeFilter)
  }, [items, activeFilter])

  const {
    visibleItems: visibleHistoryItems,
    hasMore: hasMoreHistory,
    remainingCount: remainingHistory,
    sentinelRef: historySentinelRef,
    loadMore: loadMoreHistory,
  } = useLazyList(filteredItems, {
    initialCount: 8,
    batchSize: 8,
    resetKey: activeFilter,
  })

  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter((i) => i.watch_status === 'Selesai').length
    const watching = items.filter((i) => i.watch_status === 'Sedang Ditonton').length
    const totalWatches = items.reduce((sum, i) => sum + (Number(i.watch_count) || 1), 0)
    return { total, completed, watching, totalWatches }
  }, [items])

  const openEditModal = (item) => {
    setEditingItem(item)
    setEditForm({
      watch_status: item.watch_status || 'Selesai',
      last_episode_number: Number(item.last_episode_number) || 1,
      total_episodes: Number(item.total_episodes) || 1,
      progress_percent: Number(item.progress_percent) || 0,
      watch_count: Number(item.watch_count) || 1,
      notes: item.notes || '',
    })
  }

  const handleSaveManualEdit = async (e) => {
    e.preventDefault()
    if (!editingItem) return
    try {
      setSavingEdit(true)
      const totalEp = Math.max(1, Number(editForm.total_episodes) || 1)
      const lastEp = Math.min(totalEp, Math.max(0, Number(editForm.last_episode_number) || 0))
      const computedPct =
        editForm.watch_status === 'Selesai'
          ? 100
          : Math.min(100, Math.max(0, Number(editForm.progress_percent) || Math.round((lastEp / totalEp) * 100)))

      const res = await historyService.updateHistory(editingItem.id, {
        watch_status: editForm.watch_status,
        last_episode_number: lastEp,
        total_episodes: totalEp,
        progress_percent: computedPct,
        watch_count: Math.max(1, Number(editForm.watch_count) || 1),
        notes: editForm.notes.trim(),
        touch_watched_at: true,
      })

      if (res.success) {
        setEditingItem(null)
        setFeedback('Histori tontonan berhasil diperbarui secara manual!')
        setTimeout(() => setFeedback(''), 3000)
        loadHistory()
      }
    } finally {
      setSavingEdit(false)
    }
  }

  const handleQuickRewatch = async (item) => {
    const nextCount = (Number(item.watch_count) || 1) + 1
    const res = await historyService.updateHistory(item.id, {
      watch_status: 'Ditonton Ulang',
      last_episode_number: 1,
      progress_percent: item.total_episodes > 1 ? Math.round((1 / item.total_episodes) * 100) : 10,
      watch_count: nextCount,
      touch_watched_at: true,
    })
    if (res.success) {
      setFeedback(`"${item.movie?.title || 'Film'}" ditandai Ditonton Ulang (ke-${nextCount})!`)
      setTimeout(() => setFeedback(''), 3000)
      loadHistory()
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await historyService.deleteHistory(deleteTarget.id)
      setDeleteTarget(null)
      setFeedback('Item dihapus dari histori tontonan.')
      setTimeout(() => setFeedback(''), 2500)
      loadHistory()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="history-page">
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <History size={14} color="#e5a93c" />
            <span>Catatan Otomatis &amp; Edit Manual</span>
          </div>
          <h1 className="masthead-title">Histori Tontonan</h1>
          <p className="masthead-desc">
            Histori bertambah otomatis saat Anda menyelesaikan tontonan atau episode, dan dapat
            Anda ubah secara manual kapan saja untuk mengulang tontonan atau menyesuaikan progres.
          </p>
        </div>
      </section>

      {feedback && (
        <div className="toast-bar toast-bar--success">
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      {/* GUEST LOCK SCREEN — Tidak bisa akses histori sebelum login */}
      {!isAuthenticated ? (
        <div className="status-state auth-lock-state">
          <div className="auth-lock-icon">
            <Lock size={34} color="#e5a93c" />
          </div>
          <h3>Histori Tontonan Hanya untuk Pengguna yang Login</h3>
          <p>
            Sebagai pengunjung tamu, Anda tetap dapat menonton preview episode dan melihat seluruh
            katalog film. Masuk atau daftar akun terlebih dahulu untuk mencatat dan mengelola
            Histori Tontonan Anda secara permanen.
          </p>
          <div className="auth-lock-actions">
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
      ) : (
        <>
          {/* Ringkasan Statistik Histori */}
          <div className="student-stats-grid student-stats-grid--4" style={{ borderTop: 'none', paddingTop: 0, marginBottom: '22px' }}>
            <div className="student-stat-item">
              <History size={20} color="#e5a93c" />
              <div className="student-stat-val">{stats.total}</div>
              <div className="student-stat-label">Total Judul</div>
            </div>
            <div className="student-stat-item">
              <CheckCircle size={20} color="#4ade80" />
              <div className="student-stat-val">{stats.completed}</div>
              <div className="student-stat-label">Selesai</div>
            </div>
            <div className="student-stat-item">
              <Clock size={20} color="#38bdf8" />
              <div className="student-stat-val">{stats.watching}</div>
              <div className="student-stat-label">Sedang Ditonton</div>
            </div>
            <div className="student-stat-item">
              <RotateCcw size={20} color="#a855f7" />
              <div className="student-stat-val">{stats.totalWatches}x</div>
              <div className="student-stat-label">Total Tontonan</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="adv-filter" style={{ marginBottom: '20px' }}>
            <div className="adv-filter__pills">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`pill ${activeFilter === st ? 'pill--active' : ''}`}
                  onClick={() => setActiveFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="status-state">
              <Loader size={30} className="spin" />
              <p>Memuat histori tontonan Anda...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="status-state">
              <Film size={40} color="#495a74" />
              <h3>Belum ada histori tontonan</h3>
              <p>
                Buka detail film/drama lalu tonton preview episode hingga selesai atau klik
                &ldquo;Selesai Menonton Episode Ini&rdquo; untuk mencatat histori otomatis!
              </p>
              {onNavigateCatalog && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onNavigateCatalog}
                  style={{ marginTop: '12px' }}
                >
                  Jelajahi Film <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="history-list">
                {visibleHistoryItems.map((item) => {
                  const m = item.movie || {}
                  const statusClass =
                    item.watch_status === 'Selesai'
                      ? 'history-badge--done'
                      : item.watch_status === 'Ditonton Ulang'
                        ? 'history-badge--rewatch'
                        : 'history-badge--watching'

                  return (
                    <article key={item.id} className="history-card">
                      <div
                        className="history-card__poster-wrap"
                        onClick={() => m.id && onSelectMovie && onSelectMovie(m)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && m.id && onSelectMovie) onSelectMovie(m)
                        }}
                      >
                        <LazyImage
                          src={
                            m.image_url ||
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={m.title || 'Film'}
                          className="history-card__poster"
                        />
                      </div>

                    <div className="history-card__body">
                      <div className="history-card__top">
                        <div>
                          <div className="history-card__badges">
                            <span className={`history-badge ${statusClass}`}>
                              {item.watch_status}
                            </span>
                            {m.type && <span className="lineup-type">{m.type}</span>}
                            <span className="marathon-meta-pill">
                              Ditonton {item.watch_count || 1}x
                            </span>
                          </div>
                          <h3
                            className="history-card__title"
                            onClick={() => m.id && onSelectMovie && onSelectMovie(m)}
                          >
                            {m.title || 'Film Terhapus'}
                          </h3>
                        </div>

                        {m.rating && (
                          <span className="stat-pill" style={{ padding: '4px 9px', fontSize: '0.78rem' }}>
                            <Star size={12} fill="#e5a93c" stroke="#e5a93c" />{' '}
                            {formatRating(m.rating)}
                          </span>
                        )}
                      </div>

                      <div className="history-card__progress-wrap">
                        <div className="marathon-progress-head">
                          <span>
                            {item.total_episodes > 1
                              ? `Episode ${item.last_episode_number} / ${item.total_episodes}`
                              : item.watch_status}
                          </span>
                          <strong>{item.progress_percent}%</strong>
                        </div>
                        <div className="marathon-progress-bar">
                          <div
                            className="marathon-progress-fill"
                            style={{ width: `${item.progress_percent}%` }}
                          />
                        </div>
                      </div>

                      {item.notes && <p className="history-card__notes">Catatan: {item.notes}</p>}

                      <div className="history-card__footer">
                        <span className="review-card__date">
                          Terakhir ditonton:{' '}
                          {new Date(item.watched_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <div className="history-card__actions">
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() => handleQuickRewatch(item)}
                            title="Tandai ingin menonton ulang"
                          >
                            <RotateCcw size={13} /> Tonton Ulang
                          </button>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit2 size={13} /> Edit Manual
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => setDeleteTarget(item)}
                            aria-label="Hapus histori"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
                })}
              </div>

              {hasMoreHistory && (
                <div ref={historySentinelRef} className="lazy-load-sentinel">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={loadMoreHistory}
                  >
                    <ChevronDown size={14} /> Muat Histori Lainnya ({remainingHistory} lagi)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal Edit Histori Manual */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-box auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal__header">
              <div>
                <h3 className="modal-title">Edit Histori Tontonan</h3>
                <p className="auth-modal__sub">{editingItem.movie?.title}</p>
              </div>
              <button
                type="button"
                className="pwa-toast__close"
                onClick={() => setEditingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManualEdit} className="auth-form">
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="h-status" className="form-label">
                  Status Tontonan
                </label>
                <select
                  id="h-status"
                  className="form-select"
                  value={editForm.watch_status}
                  onChange={(e) => {
                    const nextStatus = e.target.value
                    setEditForm((p) => ({
                      ...p,
                      watch_status: nextStatus,
                      progress_percent: nextStatus === 'Selesai' ? 100 : p.progress_percent,
                      last_episode_number:
                        nextStatus === 'Selesai' ? p.total_episodes : p.last_episode_number,
                    }))
                  }}
                >
                  <option value="Sedang Ditonton">Sedang Ditonton</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditonton Ulang">Ditonton Ulang (Rewatch)</option>
                </select>
              </div>

              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="h-ep" className="form-label">
                    Episode Terakhir
                  </label>
                  <input
                    id="h-ep"
                    type="number"
                    min="0"
                    max={editForm.total_episodes}
                    className="form-input"
                    value={editForm.last_episode_number}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0
                      const pct = Math.min(
                        100,
                        Math.round((val / Math.max(1, editForm.total_episodes)) * 100),
                      )
                      setEditForm((p) => ({
                        ...p,
                        last_episode_number: val,
                        progress_percent: pct,
                      }))
                    }}
                  />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="h-total" className="form-label">
                    Total Episode
                  </label>
                  <input
                    id="h-total"
                    type="number"
                    min="1"
                    className="form-input"
                    value={editForm.total_episodes}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        total_episodes: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="h-pct" className="form-label">
                    Progres (%)
                  </label>
                  <input
                    id="h-pct"
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    value={editForm.progress_percent}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, progress_percent: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="h-count" className="form-label">
                    Jumlah Tontonan (Rewatch)
                  </label>
                  <input
                    id="h-count"
                    type="number"
                    min="1"
                    className="form-input"
                    value={editForm.watch_count}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        watch_count: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="h-notes" className="form-label">
                  Catatan Pribadi
                </label>
                <textarea
                  id="h-notes"
                  rows={2}
                  className="form-textarea"
                  placeholder="misal: Lanjut menit 35:10 atau mau tonton ulang bareng teman..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={savingEdit}>
                  <Save size={14} /> {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus dari Histori?"
        message={`Hapus "${deleteTarget?.movie?.title || 'judul ini'}" dari histori tontonan Anda?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
