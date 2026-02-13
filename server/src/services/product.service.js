import api from '@/config/api'

const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value)
      }
    })

    const response = await api.get(`/products?${queryParams.toString()}`)
    return response.data
  },

  // Get single product
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Get farmer's products
  getMyProducts: async (params = {}) => {
    const queryParams = new URLSearchParams(params)
    const response = await api.get(`/products/my/products?${queryParams.toString()}`)
    return response.data
  },

  // Create product
  createProduct: async (productData) => {
    const formData = new FormData()
    
    // Append text fields
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })

    // Append images
    if (productData.images) {
      productData.images.forEach((image) => {
        formData.append('images', image)
      })
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update product
  updateProduct: async (id, productData) => {
    const formData = new FormData()
    
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'newImages' && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })

    // Append new images
    if (productData.newImages) {
      productData.newImages.forEach((image) => {
        formData.append('images', image)
      })
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Toggle availability
  toggleAvailability: async (id) => {
    const response = await api.patch(`/products/${id}/toggle-availability`)
    return response.data
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories')
    return response.data
  },

  // Get products by farmer
  getProductsByFarmer: async (farmerId, params = {}) => {
    const queryParams = new URLSearchParams(params)
    const response = await api.get(`/products/farmer/${farmerId}?${queryParams.toString()}`)
    return response.data
  },

  // Search autocomplete
  searchAutocomplete: async (query) => {
    const response = await api.get(`/products/search/autocomplete?q=${query}`)
    return response.data
  },
}

export default productService