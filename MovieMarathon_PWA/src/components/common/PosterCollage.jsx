import { Film } from 'lucide-react'
import LazyImage from './LazyImage'

/**
 * PosterCollage — Menampilkan poster dari 1 hingga 4 film terkait secara konsisten
 * pada kartu Genre maupun Collections dengan lazy loading gambar + shimmer skeleton.
 */
export default function PosterCollage({ posters = [], fallbackUrl = '', alt = 'Poster' }) {
  const uniquePosters = Array.from(new Set((posters || []).filter(Boolean))).slice(0, 4)

  if (uniquePosters.length === 0) {
    if (fallbackUrl) {
      return (
        <div className="poster-collage poster-collage--single">
          <LazyImage
            src={fallbackUrl}
            alt={alt}
            className="poster-collage__img"
            wrapperClassName="poster-collage__cell"
          />
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
        <LazyImage
          key={`${src}-${idx}`}
          src={src}
          alt={`${alt} poster ${idx + 1}`}
          className="poster-collage__img"
          wrapperClassName="poster-collage__cell"
        />
      ))}
    </div>
  )
}
