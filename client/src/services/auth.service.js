import api from '@/config/api'

/**
 * Service for authentication operations
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    return await api.post('/auth/register', userData)
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    return await api.post('/auth/login', credentials)
  },

  /**
   * Logout user
   */
  logout: async () => {
    return await api.post('/auth/logout')
  },

  /**
   * Fetch current user profile
   */
  getMe: async () => {
    return await api.get('/auth/me')
  },
}

export default authService
