import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'buyer') {
      loadCart()
    } else {
      setCart([])
    }
  }, [isAuthenticated, user])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')
      setCart(response.data.data.items || [])
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item) => {
    try {
      const response = await api.post('/cart/add', item)
      setCart(response.data.data.items)
      toast.success('Item added to cart')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart')
      return { success: false }
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.put('/cart/update', { productId, quantity })
      setCart(response.data.data.items)
      return { success: true }
    } catch (error) {
      toast.error('Failed to update quantity')
      return { success: false }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`)
      setCart(response.data.data.items)
      toast.success('Item removed from cart')
      return { success: true }
    } catch (error) {
      toast.error('Failed to remove item')
      return { success: false }
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      setCart([])
      toast.success('Cart cleared')
      return { success: true }
    } catch (error) {
      toast.error('Failed to clear cart')
      return { success: false }
    }
  }

  const cartTotal = Array.isArray(cart) ? cart.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0) : 0

  const cartCount = Array.isArray(cart) ? cart.reduce((count, item) => count + item.quantity, 0) : 0

  const value = {
    cart,
    loading,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}