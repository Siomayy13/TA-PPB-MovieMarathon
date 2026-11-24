import { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Catalog from './pages/Catalog'
import GenresPage from './pages/GenresPage'
import MarathonsPage from './pages/MarathonsPage'
import WatchlistPage from './pages/WatchlistPage'
import ProfilePage from './pages/ProfilePage'
import TipsPage from './pages/TipsPage'
import CreateMoviePage from './pages/CreateMoviePage'
import EditMoviePage from './pages/EditMoviePage'
import CreateMarathonPage from './pages/CreateMarathonPage'
import MovieDetail from './components/movie/MovieDetail'
import MarathonDetail from './components/marathon/MarathonDetail'
import SplashScreen from './components/common/SplashScreen'
import PWABadge from './components/PWABadge'
import ConfirmModal from './components/modals/ConfirmModal'
import movieService from './services/movieService'
import marathonService from './services/marathonService'
import './App.css'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('Catalog')
  // 'list' | 'create' | 'edit' | 'detail' | 'marathon-detail' | 'create-marathon'
  const [mode, setMode] = useState('list')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedMarathon, setSelectedMarathon] = useState(null)
  const [editingMovie, setEditingMovie] = useState(null)

  // Global Delete Target (movie or marathon)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteType, setDeleteType] = useState('movie')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = 'Movie Marathon — Database Drama, Movie & Paket Marathon'
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNavigate = (destination, payload) => {
    if (destination === 'Create') {
      setMode('create')
      scrollTop()
    } else if (destination === 'CreateMarathon') {
      setMode('create-marathon')
      scrollTop()
    } else if (destination === 'Edit') {
      setEditingMovie(payload)
      setMode('edit')
      scrollTop()
    } else if (destination === 'Detail') {
      setSelectedMovie(payload)
      setMode('detail')
      scrollTop()
    } else if (destination === 'MarathonDetail') {
      setSelectedMarathon(payload)
      setMode('marathon-detail')
      scrollTop()
    } else {
      setActiveTab(destination)
      setMode('list')
      setSelectedMovie(null)
      setSelectedMarathon(null)
      setEditingMovie(null)
      scrollTop()
    }
  }

  const handleBackToList = () => {
    if (mode === 'detail' && selectedMarathon && activeTab === 'Marathons') {
      setSelectedMovie(null)
      setMode('marathon-detail')
      return
    }
    setMode('list')
    setSelectedMovie(null)
    setSelectedMarathon(null)
    setEditingMovie(null)
  }

  const handleGlobalDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      if (deleteType === 'marathon') {
        await marathonService.deleteMarathon(deleteTarget.id)
        setDeleteTarget(null)
        setSelectedMarathon(null)
        setMode('list')
        setActiveTab('Marathons')
      } else {
        await movieService.deleteMovie(deleteTarget.id)
        setDeleteTarget(null)
        setSelectedMovie(null)
        setMode('list')
        setActiveTab('Catalog')
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="shell">
      {/* Intro Splash Animation */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Minimal Top App Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
        onNavigateCreate={() => handleNavigate('Create')}
        onNavigateCreateMarathon={() => handleNavigate('CreateMarathon')}
      />

      {/* Main Body View */}
      <main className="main-content">
        {mode === 'create' && (
          <CreateMoviePage
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setActiveTab('Catalog')
            }}
          />
        )}

        {mode === 'edit' && (
          <EditMoviePage
            movie={editingMovie}
            movieId={editingMovie?.id}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setActiveTab('Catalog')
            }}
          />
        )}

        {mode === 'create-marathon' && (
          <CreateMarathonPage
            onBack={() => handleNavigate('Marathons')}
            onSuccess={() => {
              handleNavigate('Marathons')
            }}
          />
        )}

        {mode === 'detail' && selectedMovie && (
          <MovieDetail
            movie={selectedMovie}
            onBack={handleBackToList}
            onEdit={(m) => handleNavigate('Edit', m)}
            onDelete={(m) => {
              setDeleteType('movie')
              setDeleteTarget(m)
            }}
          />
        )}

        {mode === 'marathon-detail' && selectedMarathon && (
          <MarathonDetail
            marathon={selectedMarathon}
            onBack={() => handleNavigate('Marathons')}
            onSelectMovie={(m) => handleNavigate('Detail', m)}
            onDelete={(mar) => {
              setDeleteType('marathon')
              setDeleteTarget(mar)
            }}
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
                onEditMovie={(m) => handleNavigate('Edit', m)}
              />
            )}

            {activeTab === 'Marathons' && (
              <MarathonsPage
                onSelectMarathon={(mar) => handleNavigate('MarathonDetail', mar)}
                onCreateMarathon={() => handleNavigate('CreateMarathon')}
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
              <ProfilePage onReplaySplash={() => setShowSplash(true)} />
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

      {/* PWA Offline and Install Prompt */}
      <PWABadge />

      {/* App Footer */}
      <Footer />

      {/* Persistent Bottom Navigation Bar (5 Halaman Utama) */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => handleNavigate(tab)} />
    </div>
  )
}
