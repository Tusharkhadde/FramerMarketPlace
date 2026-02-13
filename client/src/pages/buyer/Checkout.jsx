import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Clock,
  CreditCard,
  Check,
  ChevronRight,
  ArrowLeft,
  Plus,
  Loader2,
  Truck,
  Wallet,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import orderService from '@/services/order.service'
import paymentService from '@/services/payment.service'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from 'sonner'

const districts = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
]

const timeSlots = [
  { value: 'morning', label: 'Morning (8 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
  { value: 'evening', label: 'Evening (4 PM - 8 PM)' },
]

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, getCartTotal, clearCart, getItemsByFarmer } = useCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  // Form states
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    pincode: '',
  })
  const [deliverySchedule, setDeliverySchedule] = useState({
    date: '',
    timeSlot: 'morning',
  })
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [orderNotes, setOrderNotes] = useState('')

  // Calculate totals
  const subtotal = getCartTotal()
  const deliveryCharge = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryCharge

  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart')
    }
    fetchSavedAddresses()
  }, [items, navigate, orderComplete])

  const fetchSavedAddresses = async () => {
    try {
      // Fetch user's saved addresses
      // For now, using user's addresses from profile
      if (user?.addresses?.length > 0) {
        setSavedAddresses(user.addresses)
        const defaultAddr = user.addresses.find((a) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleAddAddress = () => {
    // Validate new address
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.addressLine1 ||
      !newAddress.district ||
      !newAddress.pincode
    ) {
      toast.error('Please fill all required fields')
      return
    }

    const newAddr = {
      _id: Date.now().toString(),
      ...newAddress,
      isDefault: savedAddresses.length === 0,
    }
    setSavedAddresses([...savedAddresses, newAddr])
    setSelectedAddressId(newAddr._id)
    setAddressDialogOpen(false)
    setNewAddress({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      pincode: '',
    })
    toast.success('Address added')
  }

  const getMinDeliveryDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedAddressId) {
      toast.error('Please select a delivery address')
      return
    }
    if (currentStep === 2 && !deliverySchedule.date) {
      toast.error('Please select a delivery date')
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    try {
      const selectedAddress = savedAddresses.find(
        (a) => a._id === selectedAddressId
      )

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: selectedAddress,
        deliverySchedule,
        paymentMethod,
        notes: orderNotes,
      }

      if (paymentMethod === 'online') {
        // Create Razorpay order
        const razorpayLoaded = await loadRazorpay()
        if (!razorpayLoaded) {
          toast.error('Payment gateway failed to load')
          setIsProcessing(false)
          return
        }

        const { data } = await paymentService.createOrder(total)

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'FarmMarket',
          description: 'Order Payment',
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              // Verify payment
              await paymentService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })

              // Create order
              const orderResponse = await orderService.createOrder({
                ...orderData,
                paymentDetails: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                },
              })

              setCompletedOrder(orderResponse.data.order)
              setOrderComplete(true)
              clearCart()
              toast.success('Order placed successfully!')
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
          modal: {
            ondismiss: () => {
              setIsProcessing(false)
            },
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        // COD order
        const orderResponse = await orderService.createOrder(orderData)
        setCompletedOrder(orderResponse.data.order)
        setOrderComplete(true)
        clearCart()
        toast.success('Order placed successfully!')
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsProcessing(false)
    }
  }

  const steps = [
    { number: 1, title: 'Address', icon: MapPin },
    { number: 2, title: 'Schedule', icon: Clock },
    { number: 3, title: 'Payment', icon: CreditCard },
  ]

  // Order Confirmation Screen
  if (orderComplete && completedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-semibold">#{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-farmer-600">
                    {formatPrice(completedOrder.pricing?.total || total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">
                    {completedOrder.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="font-semibold">
                    {new Date(deliverySchedule.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="farmer" onClick={() => navigate('/orders')}>
                Track Order
              </Button>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/cart')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    currentStep >= step.number
                      ? 'bg-farmer-500 border-farmer-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium hidden sm:block',
                    currentStep >= step.number
                      ? 'text-farmer-600'
                      : 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-24 h-0.5 mx-4',
                      currentStep > step.number
                        ? 'bg-farmer-500'
                        : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Address</CardTitle>
                      <CardDescription>
                        Select or add a delivery address
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {savedAddresses.length > 0 ? (
                        <RadioGroup
                          value={selectedAddressId}
                          onValueChange={setSelectedAddressId}
                          className="space-y-3"
                        >
                          {savedAddresses.map((address) => (
                            <div
                              key={address._id}
                              className={cn(
                                'flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
                                selectedAddressId === address._id
                                  ? 'border-farmer-500 bg-farmer-50'
                                  : 'hover:bg-gray-50'
                              )}
                              onClick={() => setSelectedAddressId(address._id)}
                            >
                              <RadioGroupItem value={address._id} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-farmer-100 text-farmer-700 px-2 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {address.addressLine1}
                                  {address.addressLine2 &&
                                    `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city && `${address.city}, `}
                                  {address.district}, Maharashtra - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Phone: {address.phone}
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No saved addresses</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setAddressDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Delivery Schedule */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Schedule</CardTitle>
                      <CardDescription>
                        Choose your preferred delivery date and time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="date">Delivery Date</Label>
                        <Input
                          id="date"
                          type="date"
                          min={getMinDeliveryDate()}
                          value={deliverySchedule.date}
                          onChange={(e) =>
                            setDeliverySchedule((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Time Slot</Label>
                        <RadioGroup
                          value={deliverySchedule.timeSlot}
                          onValueChange={(value) =>
                            setDeliverySchedule((prev) => ({
                              ...prev,
                              timeSlot: value,
                            }))
                          }
                          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                        >
                          {timeSlots.map((slot) => (
                            <div
                              key={slot.value}
                              className={cn(
                                'flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors',
                                deliverySchedule.timeSlot === slot.value
                                  ? 'border-farmer-500 bg-farmer-50'
                                  : 'hover:bg-gray-50'
                              )}
                              onClick={() =>
                                setDeliverySchedule((prev) => ({
                                  ...prev,
                                  timeSlot: slot.value,
                                }))
                              }
                            >
                              <RadioGroupItem value={slot.value} />
                              <span className="text-sm font-medium">
                                {slot.label}
                              </span>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Order Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special instructions for delivery..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                      <CardDescription>
                        Choose how you'd like to pay
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-3"
                      >
                        <div
                          className={cn(
                            'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
                            paymentMethod === 'online'
                              ? 'border-farmer-500 bg-farmer-50'
                              : 'hover:bg-gray-50'
                          )}
                          onClick={() => setPaymentMethod('online')}
                        >
                          <RadioGroupItem value="online" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-farmer-600" />
                              <span className="font-medium">Online Payment</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Pay securely with UPI, Card, Net Banking
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <img
                              src="/images/upi.png"
                              alt="UPI"
                              className="h-6"
                            />
                            <img
                              src="/images/visa.png"
                              alt="Visa"
                              className="h-6"
                            />
                          </div>
                        </div>

                        <div
                          className={cn(
                            'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
                            paymentMethod === 'cod'
                              ? 'border-farmer-500 bg-farmer-50'
                              : 'hover:bg-gray-50'
                          )}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <RadioGroupItem value="cod" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-5 h-5 text-farmer-600" />
                              <span className="font-medium">Cash on Delivery</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Pay when you receive your order
                            </p>
                          </div>
                        </div>
                      </RadioGroup>

                      {paymentMethod === 'online' && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            Powered by Razorpay. Your payment is 100% secure.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePreviousStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button variant="farmer" onClick={handleNextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="farmer"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order - {formatPrice(total)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} kg × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-farmer-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedAddressId && currentStep >= 1 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="w-4 h-4 text-farmer-600" />
                        Delivering to
                      </div>
                      <p className="text-sm text-gray-600">
                        {savedAddresses.find((a) => a._id === selectedAddressId)
                          ?.fullName}
                        ,{' '}
                        {savedAddresses.find((a) => a._id === selectedAddressId)
                          ?.district}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Enter your delivery address details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={newAddress.fullName}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="House/Flat No., Building Name"
                value={newAddress.addressLine1}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    addressLine1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Street, Area"
                value={newAddress.addressLine2}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    addressLine2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select
                  value={newAddress.district}
                  onValueChange={(value) =>
                    setNewAddress((prev) => ({ ...prev, district: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={newAddress.pincode}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))
                }
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="farmer" onClick={handleAddAddress}>
              Add Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Checkout