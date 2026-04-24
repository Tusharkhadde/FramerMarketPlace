import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Timer, ArrowRight, Package, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const CommunityDeals = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [joinQuantity, setJoinQuantity] = useState('')
  const [joining, setJoining] = useState(false)
  
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/group-buys')
      setDeals(response.data.data.deals)
    } catch (error) {
      toast.error('Failed to load community deals')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClick = (deal) => {
    if (!isAuthenticated) {
      toast.error('Please login to join this deal')
      navigate('/login?redirect=/community-deals')
      return
    }

    if (user?.userType !== 'buyer') {
      toast.error('Only buyers can join community deals')
      return
    }

    // Check if already joined
    const alreadyJoined = deal.participants?.some(p => p.user?._id === user._id || p.user === user._id)
    if (alreadyJoined) {
      toast.error('You have already joined this deal!')
      return
    }

    setSelectedDeal(deal)
    setJoinQuantity(deal.minParticipantQuantity.toString())
  }

  const submitJoinDeal = async (e) => {
    e.preventDefault()
    if (!selectedDeal || !joinQuantity) return

    const qty = Number(joinQuantity)
    if (qty < selectedDeal.minParticipantQuantity) {
      toast.error(`Minimum order is ${selectedDeal.minParticipantQuantity}kg`)
      return
    }

    if (qty > (selectedDeal.targetQuantity - selectedDeal.currentQuantity)) {
      toast.error(`Only ${selectedDeal.targetQuantity - selectedDeal.currentQuantity}kg left to complete this deal!`)
      return
    }

    try {
      setJoining(true)
      await api.post(`/group-buys/${selectedDeal._id}/join`, { quantity: qty })
      toast.success('Successfully joined the community deal! 🎉')
      setSelectedDeal(null)
      fetchDeals() // Refresh to update progress
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join deal')
    } finally {
      setJoining(false)
    }
  }

  const calculateDaysLeft = (expiryDate) => {
    const diffTime = Math.abs(new Date(expiryDate) - new Date())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="w-12 h-12 border-4 border-farmer-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-farmer-100 text-farmer-700 text-sm font-bold mb-4">
              <Users className="w-4 h-4" /> Group Buying
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-farmer-500 to-farmer-700">Deals</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Team up with others to unlock massive wholesale discounts directly from farmers. Once the target quantity is reached, everyone saves!
            </p>
          </motion.div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-card rounded-2xl shadow-sm border border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-foreground mb-2">No active deals right now</h3>
              <p className="text-muted-foreground">Check back later for exciting community offers!</p>
            </div>
          ) : (
            deals.map((deal, idx) => {
              const progress = Math.min(100, (deal.currentQuantity / deal.targetQuantity) * 100)
              const isEndingSoon = calculateDaysLeft(deal.expiryDate) <= 2
              
              return (
                <motion.div 
                  key={deal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden border-0 shadow-xl shadow-black/5 bg-card hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48">
                      {deal.product?.images?.[0]?.url ? (
                        <img src={deal.product.images[0].url} alt={deal.product.cropName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/95 backdrop-blur-sm text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center">
                          SAVE {Math.round(((deal.product?.pricePerKg - deal.discountPrice) / deal.product?.pricePerKg) * 100)}%
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg ${isEndingSoon ? 'bg-red-500 text-white animate-pulse' : 'bg-white/95 text-black'}`}>
                          <Timer className="w-3.5 h-3.5 mr-1" /> 
                          {calculateDaysLeft(deal.expiryDate)} Days Left
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-2xl text-foreground truncate">{deal.product?.cropName}</h3>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                        <span className="truncate">{deal.farmer?.fullName} • {deal.farmer?.district}</span>
                        {deal.product?.isOrganic && <ShieldCheck className="w-4 h-4 ml-2 text-green-500" />}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Group Price</p>
                          <p className="text-3xl font-black text-farmer-600 leading-none">{formatPrice(deal.discountPrice)}<span className="text-base font-normal text-muted-foreground">/kg</span></p>
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-semibold text-muted-foreground line-through decoration-muted-foreground/50">{formatPrice(deal.product?.pricePerKg)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-foreground">{deal.currentQuantity}kg Ordered</span>
                          <span className="text-muted-foreground">{deal.targetQuantity}kg Goal</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-farmer-400 to-farmer-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center font-medium">
                          {progress >= 100 
                            ? 'Goal reached! Deal is locked in.' 
                            : `Only ${deal.targetQuantity - deal.currentQuantity}kg more needed to unlock!`}
                        </p>
                      </div>

                      <Button 
                        onClick={() => handleJoinClick(deal)} 
                        className="w-full h-12 text-base font-bold bg-foreground hover:bg-foreground/90 text-background rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
                      >
                        Join This Deal <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Join Deal Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedDeal && (
            <form onSubmit={submitJoinDeal}>
              <DialogHeader>
                <DialogTitle className="text-2xl">Join Community Deal</DialogTitle>
                <DialogDescription>
                  Reserve your share of {selectedDeal.product?.cropName}. You won't be charged until the total goal is reached.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6 space-y-6">
                <div className="bg-muted/50 p-4 rounded-xl border border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground font-medium">Discount Price</span>
                    <span className="font-bold text-farmer-600">{formatPrice(selectedDeal.discountPrice)} /kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Minimum Order</span>
                    <span className="font-bold">{selectedDeal.minParticipantQuantity} kg</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">How many kilograms do you want?</label>
                  <Input 
                    type="number" 
                    min={selectedDeal.minParticipantQuantity}
                    max={selectedDeal.targetQuantity - selectedDeal.currentQuantity}
                    required 
                    value={joinQuantity}
                    onChange={(e) => setJoinQuantity(e.target.value)}
                    className="h-14 text-xl font-bold text-center"
                  />
                  {joinQuantity && (
                    <p className="text-center text-sm font-medium text-primary">
                      Estimated Total: {formatPrice(Number(joinQuantity) * selectedDeal.discountPrice)}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setSelectedDeal(null)}>Cancel</Button>
                <Button type="submit" disabled={joining} className="bg-farmer-600 hover:bg-farmer-700 text-white font-bold">
                  {joining ? 'Joining...' : 'Confirm & Join Deal'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CommunityDeals
