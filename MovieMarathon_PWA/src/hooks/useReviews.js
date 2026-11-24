import { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'

export function useReviews(movieId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    if (!movieId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await reviewService.getReviews(movieId)
      if (res.success) {
        setReviews(res.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [movieId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, refetch: fetchReviews }
}

export function useCreateReview() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (movieId, reviewData) => {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)
      const res = await reviewService.createReview(movieId, reviewData)
      if (res.success) {
        setSuccess(true)
        return res.data
      }
      setError('Gagal mengirim ulasan.')
      return null
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return { createReview, submitting, error, success }
}
