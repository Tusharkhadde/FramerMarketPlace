import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  Package,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from 'sonner'

const Cart = () => {
  const navigate = useNavigate()
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getItemsByFarmer,
    isEmpty,
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [removeItemId, setRemoveItemId] = useState(null)

  const deliveryCharge = getCartTotal() >= 500 ? 0 : 50
  const discount = appliedCoupon ? getCartTotal() * 0.1 : 0
  const total = getCartTotal() + deliveryCharge - discount

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'FRESH10') {
      setAppliedCoupon({ code: 'FRESH10', discount: 10 })
      toast.success('Coupon applied! 10% discount')
    } else if (couponCode.toUpperCase() === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 })
      toast.success('Coupon applied! ₹50 off')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const handleClearCart = () => {
    clearCart()
    setClearDialogOpen(false)
    toast.success('Cart cleared')
  }

  const handleRemoveItem = (productId) => {
    removeItem(productId)
    setRemoveItemId(null)
  }

  const itemsByFarmer = getItemsByFarmer()

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button variant="farmer" onClick={() => navigate('/products')}>
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {itemsByFarmer.map((farmerGroup) => (
              <Card key={farmerGroup.farmerId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Seller: {farmerGroup.farmerName}
                    </CardTitle>
                    <Badge variant="outline" className="text-farmer-600">
                      {farmerGroup.items.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {farmerGroup.items.map((item) => (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <Link to={`/products/${item.productId}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="font-medium text-gray-900 hover:text-farmer-600 truncate">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={cn(
                                'text-xs',
                                item.qualityGrade === 'A'
                                  ? 'bg-farmer-500'
                                  : item.qualityGrade === 'B'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                              )}
                            >
                              Grade {item.qualityGrade}
                            </Badge>
                          </div>
                          <p className="text-farmer-600 font-semibold mt-2">
                            {formatPrice(item.price)}/kg
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-lg bg-white">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.maxQuantity}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => setRemoveItemId(item.productId)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Low stock warning */}
                          {item.maxQuantity < 10 && (
                            <p className="text-xs text-orange-600 flex items-center mt-2">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Only {item.maxQuantity} kg left
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Try: FRESH10, FIRST50
                  </p>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-medium">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-farmer-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Free delivery notice */}
                {deliveryCharge > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Add {formatPrice(500 - getCartTotal())} more for free delivery!
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  variant="farmer"
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    { icon: Truck, text: 'Fast Delivery' },
                    { icon: ShieldCheck, text: 'Secure Payment' },
                    { icon: Package, text: 'Quality Assured' },
                    { icon: Tag, text: 'Best Prices' },
                  ].map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <badge.icon className="w-4 h-4 text-farmer-500" />
                      {badge.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Clear Cart Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Item Dialog */}
      <AlertDialog
        open={!!removeItemId}
        onOpenChange={() => setRemoveItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveItem(removeItemId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Cart