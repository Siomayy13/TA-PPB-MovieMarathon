import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Catalog from './pages/Catalog'
import GenresPage from './pages/GenresPage'
import MarathonsPage from './pages/MarathonsPage'
import HistoryPage from './pages/HistoryPage'
import WatchlistPage from './pages/WatchlistPage'
import ProfilePage from './pages/ProfilePage'
import TipsPage from './pages/TipsPage'
import CreateMoviePage from './pages/CreateMoviePage'
import EditMoviePage from './pages/EditMoviePage'
import CreateMarathonPage from './pages/CreateMarathonPage'
import EditMarathonPage from './pages/EditMarathonPage'
import MovieDetail from './components/movie/MovieDetail'
import MarathonDetail from './components/marathon/MarathonDetail'
import SplashScreen from './components/common/SplashScreen'
import WelcomeToast from './components/common/WelcomeToast'
import PWABadge from './components/PWABadge'
import ConfirmModal from './components/modals/ConfirmModal'
import AuthModal from './components/modals/AuthModal'
import movieService from './services/movieService'
import marathonService from './services/marathonService'
import {
  parseRouteFromLocation,
  getPathForTab,
  getMovieDetailPath,
  getCollectionDetailPath,
  pushRoute,
} from './utils/urlRouter'
import './App.css'

const DEFAULT_TITLE = 'Movie Marathon — Drama, Movie, Episode & Collections'

function AppShell({ logoutConfirmOpen, onCloseLogoutConfirm }) {
  const { isAdmin, isAuthenticated, openAuthModal, logout } = useAuth()

  // Baca URL awal agar direct link (/film/:id, /collections/:id, atau tab) langsung terbuka
  const [initialRoute] = useState(() => parseRouteFromLocation())

  // Lewati splash screen jika user langsung membuka direct link film/collection agar instan
  const [showSplash, setShowSplash] = useState(
    () => initialRoute.type !== 'movie' && initialRoute.type !== 'collection',
  )

  const [activeTab, setActiveTab] = useState(() =>
    initialRoute.type === 'collection'
      ? 'Marathons'
      : initialRoute.type === 'tab'
        ? initialRoute.tab
        : 'Catalog',
  )

  // 'list' | 'create' | 'edit' | 'detail' | 'marathon-detail' | 'create-marathon' | 'edit-marathon'
  const [mode, setMode] = useState(() =>
    initialRoute.type === 'movie'
      ? 'detail'
      : initialRoute.type === 'collection'
        ? 'marathon-detail'
        : 'list',
  )

  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedMovieId, setSelectedMovieId] = useState(() =>
    initialRoute.type === 'movie' ? initialRoute.movieId : null,
  )
  const [selectedMarathon, setSelectedMarathon] = useState(null)
  const [selectedMarathonId, setSelectedMarathonId] = useState(() =>
    initialRoute.type === 'collection' ? initialRoute.marathonId : null,
  )
  const [editingMovie, setEditingMovie] = useState(null)
  const [editingMarathon, setEditingMarathon] = useState(null)

  // Global Delete Target (movie or marathon)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteType, setDeleteType] = useState('movie')
  const [deleting, setDeleting] = useState(false)

  // Perbarui judul tab browser sesuai halaman aktif
  useEffect(() => {
    if (mode === 'detail' && selectedMovie?.title) {
      document.title = `${selectedMovie.title} — Movie Marathon`
    } else if (mode === 'marathon-detail' && selectedMarathon?.title) {
      document.title = `${selectedMarathon.title} — Movie Marathon`
    } else {
      document.title = DEFAULT_TITLE
    }
  }, [mode, selectedMovie, selectedMarathon])

  // Sinkronkan tombol Back / Forward browser (History API popstate)
  useEffect(() => {
    const handlePopState = () => {
      const next = parseRouteFromLocation()
      if (next.type === 'movie') {
        setSelectedMovieId(next.movieId)
        setSelectedMovie((prev) =>
          prev && String(prev.id) === String(next.movieId) ? prev : null,
        )
        setMode('detail')
      } else if (next.type === 'collection') {
        setSelectedMarathonId(next.marathonId)
        setSelectedMarathon((prev) =>
          prev && String(prev.id) === String(next.marathonId) ? prev : null,
        )
        setActiveTab('Marathons')
        setMode('marathon-detail')
      } else {
        setActiveTab(next.tab)
        setMode('list')
        setSelectedMovie(null)
        setSelectedMovieId(null)
        setSelectedMarathon(null)
        setSelectedMarathonId(null)
        setEditingMovie(null)
        setEditingMarathon(null)
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const requireAdminAccess = () => {
    if (isAdmin) return true
    if (!isAuthenticated) {
      openAuthModal('login')
    } else {
      alert('Akses ditolak: fitur ini hanya tersedia untuk akun Admin.')
    }
    return false
  }

  const handleNavigate = (destination, payload) => {
    if (destination === 'Create') {
      if (!requireAdminAccess()) return
      setMode('create')
      scrollTop()
    } else if (destination === 'CreateMarathon') {
      if (!requireAdminAccess()) return
      setMode('create-marathon')
      scrollTop()
    } else if (destination === 'Edit') {
      if (!requireAdminAccess()) return
      setEditingMovie(payload)
      setMode('edit')
      scrollTop()
    } else if (destination === 'EditMarathon') {
      if (!requireAdminAccess()) return
      setEditingMarathon(payload)
      setMode('edit-marathon')
      scrollTop()
    } else if (destination === 'Detail') {
      const movieObj = typeof payload === 'object' ? payload : null
      const movieId = movieObj ? movieObj.id : payload
      if (!movieId) return
      setSelectedMovie(movieObj)
      setSelectedMovieId(String(movieId))
      setMode('detail')
      pushRoute(getMovieDetailPath(movieId))
      scrollTop()
    } else if (destination === 'MarathonDetail') {
      const marObj = typeof payload === 'object' ? payload : null
      const marId = marObj ? marObj.id : payload
      if (!marId) return
      setSelectedMarathon(marObj)
      setSelectedMarathonId(String(marId))
      setActiveTab('Marathons')
      setMode('marathon-detail')
      pushRoute(getCollectionDetailPath(marId))
      scrollTop()
    } else {
      setActiveTab(destination)
      setMode('list')
      setSelectedMovie(null)
      setSelectedMovieId(null)
      setSelectedMarathon(null)
      setSelectedMarathonId(null)
      setEditingMovie(null)
      setEditingMarathon(null)
      pushRoute(getPathForTab(destination))
      scrollTop()
    }
  }

  const handleBackToList = () => {
    if (mode === 'detail' && (selectedMarathon || selectedMarathonId) && activeTab === 'Marathons') {
      const targetId = selectedMarathon?.id || selectedMarathonId
      setSelectedMovie(null)
      setSelectedMovieId(null)
      setMode('marathon-detail')
      if (targetId) pushRoute(getCollectionDetailPath(targetId))
      return
    }
    if (mode === 'edit-marathon' && (selectedMarathon || selectedMarathonId)) {
      const targetId = selectedMarathon?.id || selectedMarathonId
      setEditingMarathon(null)
      setMode('marathon-detail')
      if (targetId) pushRoute(getCollectionDetailPath(targetId))
      return
    }
    setMode('list')
    setSelectedMovie(null)
    setSelectedMovieId(null)
    setSelectedMarathon(null)
    setSelectedMarathonId(null)
    setEditingMovie(null)
    setEditingMarathon(null)
    pushRoute(getPathForTab(activeTab))
  }

  const handleGlobalDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      if (deleteType === 'marathon') {
        await marathonService.deleteMarathon(deleteTarget.id)
        setDeleteTarget(null)
        setSelectedMarathon(null)
        setSelectedMarathonId(null)
        setMode('list')
        setActiveTab('Marathons')
        pushRoute(getPathForTab('Marathons'))
      } else {
        await movieService.deleteMovie(deleteTarget.id)
        setDeleteTarget(null)
        setSelectedMovie(null)
        setSelectedMovieId(null)
        setMode('list')
        setActiveTab('Catalog')
        pushRoute(getPathForTab('Catalog'))
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.')
    } finally {
      setDeleting(false)
    }
  }

  const handleConfirmLogout = () => {
    logout()
    onCloseLogoutConfirm()
    setMode('list')
    setSelectedMovie(null)
    setSelectedMovieId(null)
    setSelectedMarathon(null)
    setSelectedMarathonId(null)
    setEditingMovie(null)
    setEditingMarathon(null)
    pushRoute(getPathForTab(activeTab))
  }

  return (
    <div className="shell">
      {/* Intro Splash Animation */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top App Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
        onNavigateCreate={() => handleNavigate('Create')}
        onNavigateCreateMarathon={() => handleNavigate('CreateMarathon')}
      />

      {/* Main Body View */}
      <main className="main-content">
        {mode === 'create' && isAdmin && (
          <CreateMoviePage
            onBack={handleBackToList}
            onSuccess={() => {
              handleNavigate('Catalog')
            }}
          />
        )}

        {mode === 'edit' && isAdmin && (
          <EditMoviePage
            movie={editingMovie}
            movieId={editingMovie?.id}
            onBack={handleBackToList}
            onSuccess={(updated) => {
              if (updated?.id) {
                handleNavigate('Detail', updated)
              } else {
                handleNavigate('Catalog')
              }
            }}
          />
        )}

        {mode === 'create-marathon' && isAdmin && (
          <CreateMarathonPage
            onBack={() => handleNavigate('Marathons')}
            onSuccess={() => {
              handleNavigate('Marathons')
            }}
          />
        )}

        {mode === 'edit-marathon' && isAdmin && editingMarathon && (
          <EditMarathonPage
            marathon={editingMarathon}
            marathonId={editingMarathon?.id}
            onBack={handleBackToList}
            onSuccess={(updated) => {
              setEditingMarathon(null)
              if (updated) {
                setSelectedMarathon(updated)
                setSelectedMarathonId(String(updated.id))
                setActiveTab('Marathons')
                setMode('marathon-detail')
                pushRoute(getCollectionDetailPath(updated.id))
              } else {
                handleNavigate('Marathons')
              }
            }}
          />
        )}

        {mode === 'detail' && (selectedMovie || selectedMovieId) && (
          <MovieDetail
            movie={selectedMovie}
            movieId={selectedMovieId || selectedMovie?.id}
            onMovieLoaded={(loaded) => setSelectedMovie(loaded)}
            onBack={handleBackToList}
            onEdit={isAdmin ? (m) => handleNavigate('Edit', m) : undefined}
            onDelete={
              isAdmin
                ? (m) => {
                    setDeleteType('movie')
                    setDeleteTarget(m)
                  }
                : undefined
            }
          />
        )}

        {mode === 'marathon-detail' && (selectedMarathon || selectedMarathonId) && (
          <MarathonDetail
            marathon={selectedMarathon}
            marathonId={selectedMarathonId || selectedMarathon?.id}
            onBack={() => handleNavigate('Marathons')}
            onSelectMovie={(m) => handleNavigate('Detail', m)}
            onEdit={isAdmin ? (mar) => handleNavigate('EditMarathon', mar) : undefined}
            onUpdated={(updated) => setSelectedMarathon(updated)}
            onDelete={
              isAdmin
                ? (mar) => {
                    setDeleteType('marathon')
                    setDeleteTarget(mar)
                  }
                : undefined
            }
          />
        )}

        {mode === 'list' && (
          <>
            {activeTab === 'Catalog' && (
              <Catalog
                onNavigate={(destination, payload) => handleNavigate(destination, payload)}
              />
            )}

            {activeTab === 'Genres' && (
              <GenresPage
                onSelectMovie={(m) => handleNavigate('Detail', m)}
                onEditMovie={isAdmin ? (m) => handleNavigate('Edit', m) : undefined}
              />
            )}

            {activeTab === 'Marathons' && (
              <MarathonsPage
                onSelectMarathon={(mar) => handleNavigate('MarathonDetail', mar)}
                onCreateMarathon={isAdmin ? () => handleNavigate('CreateMarathon') : undefined}
                onEditMarathon={isAdmin ? (mar) => handleNavigate('EditMarathon', mar) : undefined}
              />
            )}

            {activeTab === 'History' && (
              <HistoryPage
                onSelectMovie={(m) => handleNavigate('Detail', m)}
                onNavigateCatalog={() => handleNavigate('Catalog')}
              />
            )}

            {activeTab === 'Watchlist' && (
              <WatchlistPage
                onSelectMovie={(m) => handleNavigate('Detail', m)}
                onNavigateCatalog={() => handleNavigate('Catalog')}
              />
            )}

            {activeTab === 'Tips' && <TipsPage />}

            {activeTab === 'Profile' && (
              <ProfilePage
                onReplaySplash={() => setShowSplash(true)}
                onNavigate={handleNavigate}
                onOpenTips={() => handleNavigate('Tips')}
              />
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteType === 'marathon' ? 'Hapus Collection?' : 'Konfirmasi Hapus Film'}
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
        loading={deleting}
        onConfirm={handleGlobalDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Pop-up Konfirmasi Log Out (Pengguna & Admin) */}
      <ConfirmModal
        open={logoutConfirmOpen}
        title="Konfirmasi Log Out"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        danger
        onConfirm={handleConfirmLogout}
        onCancel={onCloseLogoutConfirm}
      />

      {/* PWA Offline and Non-Blocking Install Prompt */}
      <PWABadge />

      {/* App Footer */}
      <Footer />

      {/* Persistent Bottom Navigation Bar (6 Halaman Utama) */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => handleNavigate(tab)} />
    </div>
  )
}

export default function App() {
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [welcomeEvent, setWelcomeEvent] = useState(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const openAuthModal = useCallback((defaultMode = 'login') => {
    setAuthModal({ open: true, mode: defaultMode || 'login' })
  }, [])

  const handleAuthSuccess = useCallback((loggedInUser) => {
    if (loggedInUser) {
      setWelcomeEvent({ id: Date.now(), user: loggedInUser })
    }
  }, [])

  const handleRequestLogout = useCallback(() => {
    setLogoutConfirmOpen(true)
  }, [])

  const clearWelcome = useCallback(() => {
    setWelcomeEvent(null)
  }, [])

  return (
    <AuthProvider
      onOpenAuthModal={openAuthModal}
      onAuthSuccess={handleAuthSuccess}
      onRequestLogout={handleRequestLogout}
    >
      <WelcomeToast welcomeEvent={welcomeEvent} onDone={clearWelcome} />
      <AppShell
        logoutConfirmOpen={logoutConfirmOpen}
        onCloseLogoutConfirm={() => setLogoutConfirmOpen(false)}
      />
      <AuthModal
        open={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
      />
    </AuthProvider>
  )
}
