import { useEffect, useRef } from 'react'
import { ExternalLink, CheckCircle, X, Play, LogIn, RotateCcw } from 'lucide-react'

/**
 * Mengubah link eksternal (YouTube, Vimeo, Google Drive, atau direct MP4/WebM)
 * menjadi sumber embed / pemutar ringan tanpa perlu upload file video besar.
 * Untuk YouTube & Vimeo, mengaktifkan JS API agar event video selesai dapat dideteksi otomatis.
 */
const resolveVideoSource = (rawUrl) => {
  const url = String(rawUrl || '').trim()
  if (!url) return { type: 'invalid', provider: 'none', src: '' }

  // Direct HTML5 video file
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return { type: 'video', provider: 'html5', src: url }
  }

  // YouTube watch / youtu.be / shorts / embed
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (ytMatch) {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : ''
    return {
      type: 'iframe',
      provider: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1${origin}`,
    }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      type: 'iframe',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?api=1`,
    }
  }

  // Google Drive file link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return {
      type: 'iframe',
      provider: 'gdrive',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    }
  }

  // Fallback generic iframe
  return { type: 'iframe', provider: 'generic', src: url }
}

export default function VideoPreviewPlayer({
  episode,
  isAuthenticated,
  isWatched = false,
  onToggleWatched,
  onOpenLogin,
  onClose,
  recording = false,
}) {
  const iframeRef = useRef(null)
  const autoMarkedRef = useRef(false)

  // Reset guard setiap kali episode berganti
  useEffect(() => {
    autoMarkedRef.current = false
  }, [episode?.id])

  const { type, provider, src } = resolveVideoSource(episode?.video_url)

  // Deteksi otomatis event video selesai pada YouTube & Vimeo IFrame API
  useEffect(() => {
    if (!episode || type !== 'iframe' || (provider !== 'youtube' && provider !== 'vimeo')) {
      return undefined
    }

    const triggerAutoDone = () => {
      if (autoMarkedRef.current || isWatched) return
      autoMarkedRef.current = true
      if (isAuthenticated && onToggleWatched) {
        onToggleWatched(episode, true, true)
      }
    }

    const handleMessage = (event) => {
      if (!event?.data) return
      let payload = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }

      // YouTube: playerState === 0 menandakan video selesai diputar (ENDED)
      if (provider === 'youtube') {
        const isYtOrigin =
          typeof event.origin === 'string' &&
          (event.origin.includes('youtube.com') || event.origin.includes('youtube-nocookie.com'))
        if (!isYtOrigin) return

        if (
          (payload.event === 'onStateChange' && payload.info === 0) ||
          (payload.event === 'infoDelivery' && payload.info?.playerState === 0)
        ) {
          triggerAutoDone()
        }
      }

      // Vimeo: event 'finish' atau 'ended'
      if (provider === 'vimeo') {
        if (payload.event === 'finish' || payload.event === 'ended') {
          triggerAutoDone()
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [episode, type, provider, isAuthenticated, isWatched, onToggleWatched])

  const handleIframeLoad = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    try {
      if (provider === 'youtube') {
        win.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*')
        win.postMessage(
          JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
          '*',
        )
      } else if (provider === 'vimeo') {
        win.postMessage(JSON.stringify({ method: 'addEventListener', value: 'finish' }), '*')
        win.postMessage(JSON.stringify({ method: 'addEventListener', value: 'ended' }), '*')
      }
    } catch {
      // Abaikan cross-origin restriction jika ada
    }
  }

  if (!episode) return null

  return (
    <div className="video-preview-card">
      <div className="video-preview-head">
        <div className="video-preview-title-wrap">
          <span className="episode-num-pill">
            <Play size={12} fill="#0e131f" /> Ep {episode.episode_number}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="video-preview-title">{episode.title}</h3>
              {isAuthenticated && isWatched && (
                <span className="watched-status-pill">
                  <CheckCircle size={12} /> Sudah Ditonton
                </span>
              )}
            </div>
            {episode.duration && (
              <span className="video-preview-sub">Durasi: {episode.duration}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="pwa-toast__close"
          onClick={onClose}
          aria-label="Tutup preview video"
          title="Tutup preview"
        >
          <X size={18} />
        </button>
      </div>

      {/* Responsive 16:9 Player */}
      <div className="video-preview-frame">
        {type === 'video' ? (
          <video
            key={src}
            src={src}
            controls
            autoPlay
            playsInline
            className="video-preview-media"
            onEnded={() => {
              if (!autoMarkedRef.current && !isWatched && isAuthenticated && onToggleWatched) {
                autoMarkedRef.current = true
                onToggleWatched(episode, true, true)
              }
            }}
          >
            Browser Anda tidak mendukung pemutar video HTML5.
          </video>
        ) : type === 'iframe' ? (
          <iframe
            ref={iframeRef}
            key={src}
            src={src}
            title={episode.title}
            className="video-preview-media"
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="video-preview-invalid">Link video tidak valid.</div>
        )}
      </div>

      {episode.synopsis && <p className="video-preview-synopsis">{episode.synopsis}</p>}

      {/* Action Footer: Status Otomatis & Toggle Manual */}
      <div className="video-preview-footer">
        <a
          href={episode.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--outline btn--sm"
        >
          <ExternalLink size={14} /> Buka Link Asli
        </a>

        {isAuthenticated ? (
          <div className="video-preview-watch-controls">
            {isWatched ? (
              <>
                <span className="watched-status-pill watched-status-pill--lg">
                  <CheckCircle size={14} /> Sudah Ditonton
                </span>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={recording}
                  onClick={() => onToggleWatched && onToggleWatched(episode, false, false)}
                  title="Batalkan status selesai menonton untuk episode ini"
                >
                  <RotateCcw size={13} />
                  {recording ? 'Memperbarui...' : 'Batalkan Status'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={recording}
                onClick={() => onToggleWatched && onToggleWatched(episode, true, false)}
              >
                <CheckCircle size={14} />
                {recording ? 'Menyimpan Status...' : 'Tandai Selesai Menonton'}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => onOpenLogin && onOpenLogin('login')}
          >
            <LogIn size={14} /> Masuk untuk Simpan ke Histori Tontonan
          </button>
        )}
      </div>
    </div>
  )
}
