import { useState, useEffect, useCallback, useRef } from 'react'
import { Film, Play, Sparkles } from 'lucide-react'
import './SplashScreen.css'

export default function SplashScreen({ onFinish, duration = 4000 }) {
  const [isFading, setIsFading] = useState(false)
  const dismissedRef = useRef(false)

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setIsFading(true)
    setTimeout(() => {
      if (onFinish) onFinish()
    }, 500)
  }, [onFinish])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)

    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKey)
    }
  }, [duration, handleDismiss])

  return (
    <div
      className={`splash-overlay ${isFading ? 'splash-overlay--fading' : ''}`}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
    >
      {/* Background cinematic glow */}
      <div className="splash-ambient-glow" />

      {/* Film Strip Animation */}
      <div className="splash-film-strip">
        <div className="splash-sprockets top" />
        <div className="splash-frame-inner">
          <div className="splash-clapper-icon">
            <Film size={54} color="#e5a93c" />
          </div>
        </div>
        <div className="splash-sprockets bottom" />
      </div>

      {/* Main Title */}
      <div className="splash-brand-block">
        <div className="splash-badge">
          <Sparkles size={14} color="#e5a93c" />
          <span>CINEMA &amp; DRAMA GUIDE</span>
        </div>
        <h1 className="splash-title">MOVIE MARATHON</h1>
        <p className="splash-subtitle">DATABASE DRAMA &amp; MOVIE TERLENGKAP</p>
      </div>

      {/* Enter Button */}
      <button
        type="button"
        className="splash-enter-btn"
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
      >
        <Play size={15} fill="#0e131f" />
        <span>Mulai Nonton</span>
      </button>

      <span className="splash-click-hint">Ketuk layar untuk melewati</span>
    </div>
  )
}
