import { Film } from 'lucide-react'

/**
 * PosterCollage — Menampilkan poster dari 1 hingga 4 film terkait secara konsisten
 * pada kartu Genre maupun Collections (tidak perlu menampilkan semua poster).
 */
export default function PosterCollage({ posters = [], fallbackUrl = '', alt = 'Poster' }) {
  const uniquePosters = Array.from(new Set((posters || []).filter(Boolean))).slice(0, 4)

  if (uniquePosters.length === 0) {
    if (fallbackUrl) {
      return (
        <div className="poster-collage poster-collage--single">
          <img src={fallbackUrl} alt={alt} className="poster-collage__img" loading="lazy" />
        </div>
      )
    }
    return (
      <div className="poster-collage poster-collage--empty">
        <Film size={32} color="#505d73" />
      </div>
    )
  }

  const layoutClass =
    uniquePosters.length === 1
      ? 'poster-collage--single'
      : uniquePosters.length === 2
        ? 'poster-collage--two'
        : uniquePosters.length === 3
          ? 'poster-collage--three'
          : 'poster-collage--four'

  return (
    <div className={`poster-collage ${layoutClass}`}>
      {uniquePosters.map((src, idx) => (
        <div key={`${src}-${idx}`} className="poster-collage__cell">
          <img
            src={src}
            alt={`${alt} poster ${idx + 1}`}
            className="poster-collage__img"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
