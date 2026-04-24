import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Wallet,
  MapPin,
  Plus,
  Check,
  ArrowLeft,
  Package,
  Truck,
  Smartphone,
  ShieldCheck,
  Loader2,
  X,
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
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showDemoPayment, setShowDemoPayment] = useState(false)
  const [demoOrder, setDemoOrder] = useState(null)
  
  // Delivery Logistics State
  const [deliveryPartner, setDeliveryPartner] = useState(null)
  const [isSearchingPartners, setIsSearchingPartners] = useState(false)
  const [availablePartners, setAvailablePartners] = useState([])

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

  useEffect(() => {
    if (selectedAddress && cart.length > 0) {
      simulatePartnerSearch()
    }
  }, [selectedAddress, cart])

  const simulatePartnerSearch = () => {
    setIsSearchingPartners(true)
    setDeliveryPartner(null)
    
    // Check product delivery types
    const requiresSelfDelivery = cart.some(item => item.product.deliveryOptions?.deliveryType === 'self')
    const supportsPlatform = cart.every(item => item.product.deliveryOptions?.deliveryType === 'platform' || item.product.deliveryOptions?.deliveryType === 'both')

    setTimeout(() => {
      let partners = []
      if (requiresSelfDelivery) {
        partners = [
          { name: 'self', label: 'Farmer Direct Delivery', eta: 'Tomorrow', cost: 50, icon: Truck }
        ]
      } else if (supportsPlatform) {
        partners = [
          { name: 'porter', label: 'Porter Logistics', eta: '2 Hours', cost: 45, icon: Package },
          { name: 'dunzo', label: 'Dunzo', eta: '3 Hours', cost: 40, icon: Truck },
          { name: 'self', label: 'Farmer Direct Delivery', eta: 'Tomorrow', cost: 50, icon: Truck }
        ]
      } else {
        partners = [
          { name: 'self', label: 'Farmer Direct Delivery', eta: 'Tomorrow', cost: 50, icon: Truck }
        ]
      }
      
      setAvailablePartners(partners)
      setDeliveryPartner(partners[0]) // auto-select first
      setIsSearchingPartners(false)
    }, 1500)
  }

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
      const updatedAddresses = response.data.data.addresses
      setAddresses(updatedAddresses)
      
      // Select the newly added address (the last one in the array)
      const newAddress = updatedAddresses[updatedAddresses.length - 1]
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
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: selectedAddress,
        deliveryPartner: deliveryPartner ? {
          name: deliveryPartner.name,
          estimatedTime: deliveryPartner.eta,
          cost: deliveryPartner.cost
        } : undefined,
        paymentMethod,
        totalAmount: cartTotal + (deliveryPartner ? deliveryPartner.cost : 50) + (cartTotal * 0.05),
      }

      const response = await api.post('/orders', orderData)
      const order = response.data.data.order

      if (paymentMethod === 'online') {
        // Simulation for Demo
        setDemoOrder(order)
        setShowDemoPayment(true)
        setLoading(false)
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

  const deliveryFee = deliveryPartner ? deliveryPartner.cost : (cartTotal > 500 ? 0 : 50)
  const tax = cartTotal * 0.05
  const totalAmount = cartTotal + deliveryFee + tax

  return (
    <div className="min-h-screen bg-background py-8">
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
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
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

            {/* Delivery Partner Selection */}
            {selectedAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSearchingPartners ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <MapPin className="absolute inset-0 m-auto w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Searching Logistics Network...</p>
                        <p className="text-sm text-muted-foreground">Finding the fastest delivery partners for your location.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availablePartners.map((partner) => (
                        <div
                          key={partner.name}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryPartner?.name === partner.name ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setDeliveryPartner(partner)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryPartner?.name === partner.name ? 'bg-primary text-primary-foreground' : 'bg-muted/20'}`}>
                                <partner.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold">{partner.label}</p>
                                <p className="text-sm text-muted-foreground">Estimated Delivery: <span className="font-semibold text-foreground">{partner.eta}</span></p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(partner.cost)}</p>
                              {deliveryPartner?.name === partner.name && (
                                <div className="flex items-center justify-end text-primary mt-1">
                                  <Check className="w-4 h-4 mr-1" />
                                  <span className="text-xs font-bold uppercase">Selected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                  id="online"
                  label="UPI / Credit Card (Demo)"
                  icon={Wallet}
                  selected={paymentMethod === 'online'}
                  onSelect={() => setPaymentMethod('online')}
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
                        <p className="text-xs text-muted-foreground">
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
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
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

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Payment Modal */}
      {showDemoPayment && (
        <PaymentDemoModal
          order={demoOrder}
          onSuccess={async () => {
            await clearCart()
            navigate(`/orders/${demoOrder._id}`)
            toast.success('Demo Payment Successful!')
          }}
          onCancel={() => setShowDemoPayment(false)}
        />
      )}
    </div>
  )
}

// Demo Payment Modal Component
const PaymentDemoModal = ({ order, onSuccess, onCancel }) => {
  const [tab, setTab] = useState('upi')
  const [status, setStatus] = useState('idle') // idle, processing, verifying, success, error
  const [error, setError] = useState(null)

  const handlePay = async () => {
    setStatus('processing')

    // Step 1: Simulated local processing delay
    setTimeout(async () => {
      setStatus('verifying')

      try {
        // Step 2: Actual backend verification
        const response = await api.post('/payment/verify', {
          orderId: order._id,
          razorpayOrderId: `demo_order_${Date.now()}`,
          razorpayPaymentId: `demo_pay_${Date.now()}`,
          razorpaySignature: 'demo_signature',
          isDemo: true
        })

        if (response.data.success) {
          setStatus('success')
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          throw new Error(response.data.message || 'Verification failed')
        }
      } catch (err) {
        console.error('Payment verification error:', err)
        setError(err.response?.data?.message || err.message || 'Payment verification failed')
        setStatus('error')
      }
    }, 2000)
  }

  if (!order) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-xl border border-white/20 w-full max-w-md overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Checkout
            </h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Securely pay <span className="text-primary font-bold">{formatPrice(order.pricing?.total || order.totalAmount)}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:rotate-90"
            disabled={status !== 'idle' && status !== 'error'}
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-8">
          {status === 'idle' || status === 'error' ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex bg-muted/50 rounded-2xl p-1.5 border border-white/5">
                <button
                  onClick={() => setTab('upi')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${tab === 'upi'
                      ? 'bg-background text-primary shadow-lg shadow-black/5 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Smartphone className="w-4 h-4" />
                  UPI
                </button>
                <button
                  onClick={() => setTab('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${tab === 'card'
                      ? 'bg-background text-primary shadow-lg shadow-black/5 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm font-medium flex gap-3 items-center"
                >
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {tab === 'upi' ? (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">UPI ID</label>
                      <div className="relative group">
                        <Input
                          placeholder="yourname@upi"
                          defaultValue="success@upi"
                          className="pl-12 h-14 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 transition-all duration-300"
                        />
                        <Smartphone className="absolute left-4 top-4.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <p className="text-xs text-primary font-medium text-center leading-relaxed">
                        Demo Mode: Any UPI ID works. Use <span className="font-bold underline">success@upi</span> for a guaranteed result.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Card Number</label>
                      <div className="relative group">
                        <Input
                          placeholder="4111 1111 1111 1111"
                          defaultValue="4111 1111 1111 1111"
                          className="pl-12 h-14 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 transition-all duration-300"
                        />
                        <CreditCard className="absolute left-4 top-4.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Expiry</label>
                        <Input
                          placeholder="MM/YY"
                          defaultValue="12/28"
                          className="h-14 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CVV</label>
                        <Input
                          placeholder="123"
                          defaultValue="123"
                          type="password"
                          className="h-14 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handlePay}
                className="w-full h-16 text-lg font-bold rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.4)] transition-all duration-500 scale-100 active:scale-[0.98]"
              >
                Pay {formatPrice(order.pricing?.total || order.totalAmount)}
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Secure Demo Gateway
                </span>
              </div>
            </div>
          ) : status === 'processing' || status === 'verifying' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative size-32">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-12 h-12 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black tracking-tight">
                  {status === 'processing' ? 'Processing Transaction' : 'Verifying Payment'}
                </h4>
                <p className="text-sm text-muted-foreground font-medium px-4">
                  {status === 'processing'
                    ? 'Communicating with the bank... Please wait.'
                    : 'System is confirming the payment with the backend.'}
                </p>
              </div>
              <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: status === 'processing' ? "50%" : "90%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="bg-green-500 shadow-[0_20px_50px_rgba(34,197,94,0.4)] p-8 rounded-full"
              >
                <Check className="w-20 h-20 text-white stroke-[3px]" />
              </motion.div>
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-green-500 tracking-tight">Payment Success!</h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Your transaction has been completed successfully.<br />
                  Redirecting to your order summary...
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Address Card Component
const AddressCard = ({ address, selected, onSelect }) => (
  <div
    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selected ? 'border-primary bg-primary/10' : 'border-border'}`}
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
        <p className={`text-sm ${selected ? 'text-foreground/90' : 'text-muted-foreground'}`}>
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p className={`text-sm ${selected ? 'text-foreground/90' : 'text-muted-foreground'}`}>
          {address.city}, {address.district}, {address.state} - {address.pincode}
        </p>
        <p className={`text-sm mt-1 ${selected ? 'text-foreground/90' : 'text-muted-foreground'}`}>Phone: {address.phone}</p>
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
    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selected ? 'border-primary bg-primary/10' : 'border-border'}`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-farmer-500 text-white' : 'bg-muted/10 text-muted-foreground'
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