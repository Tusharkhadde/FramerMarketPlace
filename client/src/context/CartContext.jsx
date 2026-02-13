import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(item => item.productId === product._id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.quantityAvailable) {
          toast.error(`Only ${product.quantityAvailable} kg available`)
          return currentItems
        }
        
        toast.success('Cart updated')
        return currentItems.map(item =>
          item.productId === product._id
            ? { ...item, quantity: newQuantity }
            : item
        )
      }

      toast.success('Added to cart')
      return [...currentItems, {
        productId: product._id,
        farmerId: product.farmer._id,
        farmerName: product.farmer.fullName,
        name: product.cropName,
        image: product.images?.[0] || '/images/placeholder.jpg',
        price: product.pricePerKg,
        quantity,
        maxQuantity: product.quantityAvailable,
        qualityGrade: product.qualityGrade,
      }]
    })
  }

  const removeItem = (productId) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter(item => item.productId !== productId)
      toast.success('Removed from cart')
      return newItems
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return

    setItems((currentItems) => {
      const item = currentItems.find(item => item.productId === productId)
      if (item && quantity > item.maxQuantity) {
        toast.error(`Only ${item.maxQuantity} kg available`)
        return currentItems
      }

      return currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const getItemsByFarmer = () => {
    const farmerMap = {}
    items.forEach(item => {
      if (!farmerMap[item.farmerId]) {
        farmerMap[item.farmerId] = {
          farmerId: item.farmerId,
          farmerName: item.farmerName,
          items: [],
        }
      }
      farmerMap[item.farmerId].items.push(item)
    })
    return Object.values(farmerMap)
  }

  const value = {
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getItemsByFarmer,
    isEmpty: items.length === 0,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}