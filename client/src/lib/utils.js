import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getProductImageUrl(url) {
  // Derive API base from VITE_API_URL (which is like http://localhost:5000/api)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const apiBase = apiUrl.replace(/\/api\/?$/, '')

  // Prefer local placeholder in public folder
  const placeholder = '/placeholder.svg'

  if (!url) return placeholder
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads')) return `${apiBase}${url}`
  if (url.startsWith('uploads')) return `${apiBase}/${url}`
  return url
}