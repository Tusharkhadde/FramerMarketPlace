import api from '@/config/api'

/**
 * Service for user-related API operations
 */
export const userService = {
  /**
   * Update user profile data
   */
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData)
  },

  /**
   * Add a new delivery address
   */
  addAddress: async (addressData) => {
    return await api.post('/users/addresses', addressData)
  },

  /**
   * Remove a delivery address
   */
  deleteAddress: async (addressId) => {
    return await api.delete(`/users/addresses/${addressId}`)
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (addressId) => {
    return await api.patch(`/users/addresses/${addressId}/default`)
  },
}

export default userService
