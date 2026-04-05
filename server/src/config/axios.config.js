import axios from 'axios'

/**
 * Secure Axios instance for backend outbound requests.
 * Standardizes security best practices to prevent SSRF, DoS, and resource exhaustion.
 */
const axiosInstance = axios.create({
  // Default timeout to prevent hanging requests and resource exhaustion
  timeout: 10000, 

  // Limit redirects to prevent SSRF redirect loops
  maxRedirects: 3,

  // Limit response size to prevent memory-based DoS (e.g., 5MB)
  maxContentLength: 5 * 1024 * 1024,
  maxBodyLength: 5 * 1024 * 1024,

  headers: {
    'User-Agent': 'FarmerMarketPlace-Backend/1.0.0',
    'Accept': 'application/json',
  },
})

/**
 * Utility to validate URLs before making requests (SSRF Protection).
 * Should be used if the URL is partially controlled by user input.
 */
export const validateUrl = (url) => {
  try {
    const parsed = new URL(url)
    
    // Disallow internal/private IP ranges
    const isPrivate = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|0\.|169\.254\.)/.test(parsed.hostname)
    
    if (isPrivate || parsed.hostname === 'localhost') {
      throw new Error('Forbidden: Internal address')
    }

    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Forbidden: Protocol not allowed')
    }

    return true
  } catch (err) {
    return false
  }
}

// Add interceptors if needed (e.g., global logging)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for monitoring but don't leak internals
    console.error(`[Axios Service Error] ${error.config?.url} - ${error.message}`)
    return Promise.reject(error)
  }
)

export default axiosInstance
