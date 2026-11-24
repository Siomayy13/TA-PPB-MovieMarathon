import { Film, Wifi, Download } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-brand">
            <Film size={18} color="#e5a93c" />
            <span>Movie Marathon</span>
          </div>
          <p className="footer-desc">
            Katalog film, drama Korea, anime, dan perencana sesi maraton lengkap dengan watchlist,
            ulasan komunitas, dan dukungan mode offline.
          </p>
        </div>

        <div className="footer-right">
          <div className="pwa-status-pills">
            <span className="footer-badge">
              <Wifi size={13} color="#27ae60" /> Offline Ready
            </span>
            <span className="footer-badge">
              <Download size={13} color="#e5a93c" /> Installable App
            </span>
          </div>
          <p className="footer-copy">
            Movie Marathon &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
