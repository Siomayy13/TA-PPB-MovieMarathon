import { useState, useEffect } from 'react'
import { Download, WifiOff, X } from 'lucide-react'

const DISMISS_KEY = 'movie_marathon_install_dismissed'

export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }

  // Banner tipis non-melayang di atas footer (tidak pernah menutupi tombol aksi utama)
  if (isOffline) {
    return (
      <div className="pwa-inline-wrap">
        <aside className="pwa-inline-banner pwa-inline-banner--offline" role="status" aria-live="polite">
          <div className="pwa-inline-banner__content">
            <WifiOff size={16} color="#e5a93c" />
            <span>Mode Offline Aktif &mdash; Katalog, watchlist, dan progres tontonan lokal tetap dapat digunakan.</span>
          </div>
        </aside>
      </div>
    )
  }

  if (installPrompt && !installed && !dismissed) {
    return (
      <div className="pwa-inline-wrap">
        <aside className="pwa-inline-banner pwa-inline-banner--install" role="region" aria-label="Install Aplikasi">
          <div className="pwa-inline-banner__content">
            <Download size={16} color="#e5a93c" />
            <span>
              Pasang <strong>Movie Marathon</strong> di layar utama untuk akses lebih cepat &amp; mode offline.
            </span>
          </div>
          <div className="pwa-inline-banner__actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleInstallClick}
            >
              Install Sekarang
            </button>
            <button
              type="button"
              className="pwa-toast__close"
              onClick={handleDismiss}
              aria-label="Tutup banner instalasi"
              title="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      </div>
    )
  }

  return null
}
