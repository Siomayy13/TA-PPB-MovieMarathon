// ---------------------------------------------------------------------------
// userService.js — Student profile & operator identity management
// Stores Nama, NIM, Kelompok, avatar, bio in localStorage.
// ---------------------------------------------------------------------------

const USER_ID_KEY = 'movie_marathon_user_id'
const USER_PROFILE_KEY = 'movie_marathon_profile'

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getUserIdentifier = () => {
  try {
    let uid = localStorage.getItem(USER_ID_KEY)
    if (!uid) {
      uid = generateUUID()
      localStorage.setItem(USER_ID_KEY, uid)
    }
    return uid
  } catch {
    return generateUUID()
  }
}

export const getUserProfile = () => {
  const defaultProfile = {
    nama: 'May Triastuti',
    nim: '21120124130088',
    kelompok: 'Kelompok 24',
    favoriteGenre: 'Sci-Fi & K-Drama',
    bio: 'Pecinta film dan drama maraton akhir pekan.',
    avatar: null,
    userId: getUserIdentifier(),
    joinedDate: 'November 2026',
  }

  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Jika masih memakai nilai placeholder awal, perbarui ke data mahasiswa
      if (!parsed.nama || parsed.nama === 'Praktikan PWA') {
        const merged = { ...parsed, ...defaultProfile }
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(merged))
        return merged
      }
      return parsed
    }
  } catch {
    // ignore
  }

  return defaultProfile
}

export const saveUserProfile = (profile) => {
  try {
    const updated = {
      ...profile,
      userId: getUserIdentifier(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated))
    return { success: true, data: updated }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export default {
  getUserIdentifier,
  getUserProfile,
  saveUserProfile,
}
