import axios from 'axios'

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim()
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

export const AUTH_TOKEN_KEY = 'movie_marathon_auth_token'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor — otomatis lampirkan Bearer token jika user sudah login
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore storage error
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — unwrap data & normalisasi pesan error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan yang tidak terduga.'
    let status = null
    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Server error (${status})`
    } else if (error.request) {
      message = 'Tidak dapat terhubung ke server API. Menggunakan cache offline lokal.'
    } else {
      message = error.message || message
    }
    return Promise.reject({
      message,
      status,
      raw: error.response?.data,
    })
  },
)

export async function checkApiHealth() {
  if (!BASE_URL) {
    return {
      ok: false,
      message: 'VITE_API_BASE_URL belum diatur di file .env.',
    }
  }
  try {
    const res = await apiClient.get('/health')
    if (res?.status === 'ok') {
      return {
        ok: true,
        message: res.database_configured
          ? 'Terhubung ke server Movie Marathon secara real-time.'
          : 'Server aktif, namun koneksi database sedang belum siap.',
      }
    }
    return { ok: true, message: 'Server aktif dan merespons.' }
  } catch (err) {
    return {
      ok: false,
      message: `Server sedang tidak dapat dijangkau (${err.message}). Aplikasi berjalan dalam mode offline.`,
    }
  }
}

export { apiClient, BASE_URL }
