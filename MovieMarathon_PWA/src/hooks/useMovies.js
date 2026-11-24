import { useState, useEffect, useCallback } from 'react'
import movieService from '../services/movieService'

export function useMovies(params = {}) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('local')

  const paramKey = JSON.stringify(params)

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await movieService.getMovies(params)
      if (res.success) {
        setMovies(res.data || [])
        setSource(res.source || 'local')
      } else {
        setError('Gagal memuat database film.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat film.')
      setMovies([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  return { movies, loading, error, source, refetch: fetchMovies }
}

export function useMovieById(id) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMovie = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await movieService.getMovieById(id)
      if (res.success) {
        setMovie(res.data)
      } else {
        setError('Film tidak ditemukan.')
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail film.')
      setMovie(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMovie()
  }, [fetchMovie])

  return { movie, loading, error, refetch: fetchMovie }
}
