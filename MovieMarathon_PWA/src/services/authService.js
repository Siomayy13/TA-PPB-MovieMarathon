import { apiClient, AUTH_TOKEN_KEY } from '../config/api'

const AUTH_USER_KEY = 'movie_marathon_auth_user'

const emitAuthEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-updated'))
  }
}

const saveSession = (token, user) => {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
    if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    emitAuthEvent()
  } catch {
    // ignore quota error
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    emitAuthEvent()
  } catch {
    // ignore
  }
}

class AuthService {
  getStoredToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null
    } catch {
      return null
    }
  }

  getStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  async login(email, password) {
    const res = await apiClient.post('/auth/login', {
      email: String(email).trim(),
      password,
    })
    if (res?.token && res?.user) {
      saveSession(res.token, res.user)
      return res
    }
    throw new Error('Respons login tidak valid.')
  }

  async register({ email, password, display_name, favorite_genre = '', bio = '' }) {
    const res = await apiClient.post('/auth/register', {
      email: String(email).trim(),
      password,
      display_name: String(display_name).trim(),
      favorite_genre,
      bio,
    })
    if (res?.token && res?.user) {
      saveSession(res.token, res.user)
      return res
    }
    throw new Error('Respons registrasi tidak valid.')
  }

  async fetchMe() {
    const token = this.getStoredToken()
    if (!token) return null
    try {
      const res = await apiClient.get('/auth/me')
      if (res?.user) {
        saveSession(token, res.user)
        return res.user
      }
      return this.getStoredUser()
    } catch (err) {
      if (err?.status === 401) {
        clearSession()
        return null
      }
      // Tetap gunakan sesi lokal saat sedang offline
      return this.getStoredUser()
    }
  }

  async updateProfile(payload) {
    const res = await apiClient.put('/auth/profile', payload)
    if (res?.user) {
      saveSession(res.token || this.getStoredToken(), res.user)
      return res.user
    }
    throw new Error('Gagal memperbarui profil di database.')
  }

  async listUsers() {
    return apiClient.get('/auth/users')
  }

  async updateUserRole(userId, role) {
    return apiClient.put(`/auth/users/${userId}/role`, { role })
  }

  logout() {
    clearSession()
  }
}

export default new AuthService()
