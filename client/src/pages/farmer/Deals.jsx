import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Package, Clock, CheckCircle, TrendingDown, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'

const FarmerDeals = () => {
  const [deals, setDeals] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    productId: '',
    targetQuantity: '',
    discountPrice: '',
    expiryDate: '',
    minParticipantQuantity: '1'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dealsRes, productsRes] = await Promise.all([
        api.get('/group-buys/farmer/me'),
        api.get('/products/my/products')
      ])
      
      setDeals(dealsRes.data.data.deals)
      setProducts(productsRes.data.data.products)
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeal = async (e) => {
    e.preventDefault()
    
    // Validation
    const selectedProduct = products.find(p => p._id === formData.productId)
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    if (Number(formData.discountPrice) >= selectedProduct.pricePerKg) {
      toast.error(`Discount price must be less than regular price (${formatPrice(selectedProduct.pricePerKg)})`)
      return
    }

    try {
      setSubmitting(true)
      await api.post('/group-buys', formData)
      toast.success('Group Buy deal created successfully!')
      setIsCreateOpen(false)
      fetchData() // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-500'
      case 'reached': return 'bg-green-500'
      case 'completed': return 'bg-purple-500'
      case 'expired': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-farmer-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Group Deals</h1>
          <p className="text-muted-foreground mt-1">Create bulk-buy discounts for the community.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-farmer-600 hover:bg-farmer-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create New Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-card rounded-xl border border-border border-dashed">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Active Deals</h3>
            <p className="text-muted-foreground mb-4">Start a community deal to sell large quantities fast!</p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">Create Your First Deal</Button>
          </div>
        ) : (
          deals.map(deal => {
            const progress = Math.min(100, (deal.currentQuantity / deal.targetQuantity) * 100)
            
            return (
              <Card key={deal._id} className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-muted">
                  {deal.product?.images?.[0]?.url ? (
                    <img src={deal.product.images[0].url} alt={deal.product.cropName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${getStatusColor(deal.status)}`}>
                      {deal.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-xl mb-1 truncate">{deal.product?.cropName}</h3>
                  
                  <div className="flex items-center justify-between mb-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">Regular: {formatPrice(deal.product?.pricePerKg)}</p>
                      <p className="font-bold text-lg text-farmer-600">{formatPrice(deal.discountPrice)} <span className="text-sm font-normal text-muted-foreground">/kg</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground flex items-center justify-end"><Clock className="w-3 h-3 mr-1" /> Ends</p>
                      <p className="font-semibold text-sm">{new Date(deal.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="flex items-center"><Target className="w-4 h-4 mr-1 text-primary" /> Goal: {deal.targetQuantity}kg</span>
                      <span>{deal.currentQuantity}kg reached</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-farmer-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {deal.participants?.length || 0} Joined
                    </span>
                    <span className="text-muted-foreground">
                      Min order: {deal.minParticipantQuantity}kg
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Deal Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateDeal}>
            <DialogHeader>
              <DialogTitle>Create Community Deal</DialogTitle>
              <DialogDescription>
                Offer a bulk discount if the community reaches your target quantity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product</label>
                <Select 
                  value={formData.productId} 
                  onValueChange={(val) => setFormData({...formData, productId: val})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product from your inventory" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999]">
                    {products.map(p => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.cropName} (Reg: {formatPrice(p.pricePerKg)}) - {p.quantityAvailable}kg available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Discount Price (₹/kg)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    required 
                    placeholder="e.g. 20"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Total Quantity (kg)</label>
                  <Input 
                    type="number" 
                    min="10" 
                    required 
                    placeholder="e.g. 500"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({...formData, targetQuantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Contribution/Buyer (kg)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    required 
                    value={formData.minParticipantQuantity}
                    onChange={(e) => setFormData({...formData, minParticipantQuantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Expiry Date</label>
                  <Input 
                    type="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-xs text-primary flex gap-2">
                <TrendingDown className="w-5 h-5 shrink-0" />
                <p>Buyers will only get the discount if the <strong>Target Total Quantity</strong> is reached before the expiry date.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-farmer-600 hover:bg-farmer-700 text-white">
                {submitting ? 'Creating...' : 'Launch Deal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FarmerDeals
