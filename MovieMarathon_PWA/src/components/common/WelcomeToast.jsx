import { useEffect, useState } from 'react'
import { Shield, Sparkles } from 'lucide-react'

/**
 * WelcomeToast — Pop-up notifikasi elegan yang muncul otomatis setelah login/masuk,
 * menampilkan sapaan personal untuk Pengguna maupun Admin, lalu otomatis menghilang
 * secara halus (fade-out) setelah ~3.5 detik tanpa perlu diklik.
 */
export default function WelcomeToast({ welcomeEvent, onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!welcomeEvent) return undefined
    setLeaving(false)

    // Mulai fade-out setelah 3.2 detik
    const fadeTimer = setTimeout(() => {
      setLeaving(true)
    }, 3200)

    // Hapus komponen setelah animasi fade-out selesai (~500ms)
    const doneTimer = setTimeout(() => {
      if (onDone) onDone()
    }, 3750)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [welcomeEvent, onDone])

  if (!welcomeEvent || !welcomeEvent.user) return null

  const { user } = welcomeEvent
  const isAdmin = user.role === 'admin'
  const displayName = user.display_name || (isAdmin ? 'Admin' : 'Pengguna')

  const headline = isAdmin
    ? 'Selamat Datang, Admin!'
    : `Selamat Datang, ${displayName}!`

  const subtext = isAdmin
    ? `Masuk sebagai ${displayName} — akses penuh pengelolaan katalog aktif.`
    : 'Senang melihat Anda kembali. Selamat menikmati tontonan favorit Anda!'

  return (
    <div
      key={welcomeEvent.id}
      className={`welcome-toast ${leaving ? 'welcome-toast--leaving' : 'welcome-toast--visible'}`}
      role="status"
      aria-live="polite"
    >
      <div className="welcome-toast__icon">
        {isAdmin ? <Shield size={20} color="#0e131f" /> : <Sparkles size={20} color="#0e131f" />}
      </div>
      <div className="welcome-toast__content">
        <strong className="welcome-toast__title">{headline}</strong>
        <p className="welcome-toast__sub">{subtext}</p>
      </div>
      <div className="welcome-toast__bar" aria-hidden="true" />
    </div>
  )
}
