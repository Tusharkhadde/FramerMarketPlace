import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'

const Cart = () => {
  const navigate = useNavigate()
  const { cart, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()
  const [updatingItem, setUpdatingItem] = useState(null)

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    setUpdatingItem(productId)
    await updateQuantity(productId, newQuantity)
    setUpdatingItem(null)
  }

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await clearCart()
    }
  }

  if (loading) return <Loading />

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some fresh products to get started!
              </p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const deliveryFee = cartTotal > 500 ? 0 : 50
  const tax = cartTotal * 0.05 // 5% tax
  const totalAmount = cartTotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">{cart.length} items in your cart</p>
          </div>
          {cart.length > 0 && (
            <Button variant="outline" onClick={handleClearCart}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                updating={updatingItem === item.product._id}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(500 - cartTotal)} more for free delivery
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-farmer-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Have a promo code?</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Item Component
const CartItem = ({ item, updating, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate()
  const { product, quantity, price } = item

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div
              className="w-24 h-24 flex-shrink-0 cursor-pointer"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              <img
                src={product.images?.[0]?.url || '/placeholder.jpg'}
                alt={product.cropName}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="font-semibold text-lg cursor-pointer hover:text-farmer-600"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {product.cropName}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {product.category} • Grade {product.qualityGrade}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.farmer?.fullName} • {product.district}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(product._id)}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(product._id, quantity - 1)}
                    disabled={quantity <= 1 || updating}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(product._id, quantity + 1)}
                    disabled={quantity >= product.quantityAvailable || updating}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">kg</span>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(price)}/kg
                  </div>
                  <div className="text-lg font-bold text-farmer-600">
                    {formatPrice(price * quantity)}
                  </div>
                </div>
              </div>

              {/* Stock Warning */}
              {product.quantityAvailable < 10 && (
                <p className="mt-2 text-xs text-red-600">
                  Only {product.quantityAvailable} kg left in stock
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Cart