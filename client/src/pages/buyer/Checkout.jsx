import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Wallet,
  MapPin,
  Plus,
  Check,
  ArrowLeft,
  Package,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [addressForm, setAddressForm] = useState({
    label: 'home',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    pincode: '',
    isDefault: false,
  })

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart')
    }
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses')
      const userAddresses = response.data.data.addresses || []
      setAddresses(userAddresses)

      // Select default address or first address
      const defaultAddr = userAddresses.find(addr => addr.isDefault)
      setSelectedAddress(defaultAddr || userAddresses[0])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/users/addresses', addressForm)
      const newAddress = response.data.data.address
      setAddresses([...addresses, newAddress])
      setSelectedAddress(newAddress)
      setShowAddressForm(false)
      setAddressForm({
        label: 'home',
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        pincode: '',
        isDefault: false,
      })
      toast.success('Address added successfully')
    } catch (error) {
      toast.error('Failed to add address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    try {
      setLoading(true)

      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: selectedAddress,
        paymentMethod,
        totalAmount: cartTotal + (cartTotal > 500 ? 0 : 50) + (cartTotal * 0.05),
      }

      const response = await api.post('/orders', orderData)
      const order = response.data.data.order

      if (paymentMethod === 'razorpay') {
        // Initiate Razorpay payment
        await initiateRazorpayPayment(order)
      } else {
        // COD order
        toast.success('Order placed successfully!')
        await clearCart()
        navigate(`/orders/${order._id}`)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const initiateRazorpayPayment = async (order) => {
    try {
      // Create Razorpay order
      const response = await api.post('/payment/create-order', {
        orderId: order._id,
        amount: order.totalAmount,
      })

      const { razorpayOrderId, amount, currency } = response.data.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'FarmMarket',
        description: 'Fresh Farm Products',
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Verify payment
          try {
            await api.post('/payment/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            toast.success('Payment successful!')
            await clearCart()
            navigate(`/orders/${order._id}`)
          } catch (error) {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#22c55e',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast.error('Failed to initiate payment')
    }
  }

  if (loading) return <Loading />

  const deliveryFee = cartTotal > 500 ? 0 : 50
  const tax = cartTotal * 0.05
  const totalAmount = cartTotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    selected={selectedAddress?._id === address._id}
                    onSelect={() => setSelectedAddress(address)}
                  />
                ))}

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      placeholder="Address Line 1"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Address Line 2 (Optional)"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="District"
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Address</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <PaymentOption
                  id="razorpay"
                  label="UPI / Cards / Net Banking"
                  icon={Wallet}
                  selected={paymentMethod === 'razorpay'}
                  onSelect={() => setPaymentMethod('razorpay')}
                />
                <PaymentOption
                  id="cod"
                  label="Cash on Delivery"
                  icon={Package}
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex gap-3">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.cropName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.cropName}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} kg × {formatPrice(item.price)}
                        </p>
                        <p className="text-sm font-semibold text-farmer-600">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-farmer-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={loading || !selectedAddress}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Address Card Component
const AddressCard = ({ address, selected, onSelect }) => (
  <div
    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selected ? 'border-farmer-500 bg-farmer-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">{address.fullName}</span>
          {address.isDefault && (
            <span className="bg-farmer-100 text-farmer-700 text-xs px-2 py-1 rounded">
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.district}, {address.state} - {address.pincode}
        </p>
        <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
      </div>
      {selected && (
        <div className="w-6 h-6 bg-farmer-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  </div>
)

// Payment Option Component
const PaymentOption = ({ id, label, icon: Icon, selected, onSelect }) => (
  <div
    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selected ? 'border-farmer-500 bg-farmer-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-farmer-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {selected && (
        <div className="w-6 h-6 bg-farmer-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  </div>
)

export default Checkout