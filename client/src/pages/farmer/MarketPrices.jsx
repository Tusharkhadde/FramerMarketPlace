import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Search, MapPin, Calendar,
  BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw,
  Brain, Sparkles, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from 'sonner'

const districts = [
  'Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Kolhapur',
  'Solapur', 'Sangli', 'Satara', 'Jalgaon', 'Ahmednagar',
]

const commodities = [
  'Tomato', 'Onion', 'Potato', 'Grapes', 'Pomegranate',
  'Sugarcane', 'Wheat', 'Rice', 'Soybean', 'Cotton',
  'Turmeric', 'Red Chilli', 'Banana', 'Orange', 'Mango',
]

// Generate dummy price data
const generatePriceHistory = (basePrice) => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const variation = (Math.random() - 0.5) * basePrice * 0.3
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: Math.round(basePrice + variation),
      volume: Math.floor(Math.random() * 1000) + 100,
    }
  })
}

const generateCurrentPrices = () => [
  { commodity: 'Tomato', market: 'Nashik APMC', minPrice: 1800, maxPrice: 3000, modalPrice: 2500, arrival: 450, change: 5.2, trend: 'up' },
  { commodity: 'Onion', market: 'Nashik APMC', minPrice: 1200, maxPrice: 2100, modalPrice: 1800, arrival: 800, change: -3.1, trend: 'down' },
  { commodity: 'Potato', market: 'Pune APMC', minPrice: 800, maxPrice: 1400, modalPrice: 1100, arrival: 600, change: 2.8, trend: 'up' },
  { commodity: 'Grapes', market: 'Nashik APMC', minPrice: 4000, maxPrice: 6000, modalPrice: 5000, arrival: 200, change: 8.5, trend: 'up' },
  { commodity: 'Pomegranate', market: 'Solapur APMC', minPrice: 6000, maxPrice: 9000, modalPrice: 7500, arrival: 150, change: -1.2, trend: 'down' },
  { commodity: 'Sugarcane', market: 'Kolhapur APMC', minPrice: 2800, maxPrice: 3200, modalPrice: 3000, arrival: 1200, change: 0.5, trend: 'up' },
  { commodity: 'Wheat', market: 'Aurangabad APMC', minPrice: 2200, maxPrice: 2600, modalPrice: 2400, arrival: 500, change: 1.3, trend: 'up' },
  { commodity: 'Soybean', market: 'Latur APMC', minPrice: 4500, maxPrice: 5200, modalPrice: 4800, arrival: 350, change: -2.5, trend: 'down' },
]

const MarketPrices = () => {
  const { user } = useAuth()
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || 'Nashik')
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPrices, setCurrentPrices] = useState(generateCurrentPrices())
  const [priceHistory, setPriceHistory] = useState(generatePriceHistory(2500))
  const [aiPrediction, setAiPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  const filteredPrices = currentPrices.filter(p =>
    p.commodity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCommoditySelect = (commodity) => {
    setSelectedCommodity(commodity)
    const basePrices = {
      Tomato: 2500, Onion: 1800, Potato: 1100, Grapes: 5000,
      Pomegranate: 7500, Sugarcane: 3000, Wheat: 2400, Soybean: 4800,
    }
    setPriceHistory(generatePriceHistory(basePrices[commodity] || 2000))
    setAiPrediction(null)
  }

  const handlePredictPrice = async () => {
    setPredicting(true)
    // Simulate AI prediction
    await new Promise(resolve => setTimeout(resolve, 2000))

    const currentPrice = currentPrices.find(p => p.commodity === selectedCommodity)?.modalPrice || 2000
    const prediction7 = Math.round(currentPrice * (1 + (Math.random() - 0.3) * 0.15))
    const prediction15 = Math.round(currentPrice * (1 + (Math.random() - 0.3) * 0.25))
    const prediction30 = Math.round(currentPrice * (1 + (Math.random() - 0.3) * 0.35))

    setAiPrediction({
      commodity: selectedCommodity,
      district: selectedDistrict,
      currentPrice,
      predictions: [
        { days: 7, price: prediction7, confidence: 85 },
        { days: 15, price: prediction15, confidence: 72 },
        { days: 30, price: prediction30, confidence: 60 },
      ],
      recommendation: prediction7 > currentPrice
        ? 'HOLD - Prices expected to rise. Consider selling after 7 days.'
        : 'SELL - Prices may decrease. Consider selling now for best returns.',
      factors: [
        'Seasonal demand patterns',
        'Current market supply levels',
        'Weather forecast impact',
        'Historical price trends',
      ],
    })

    setPredicting(false)
    toast.success('Price prediction generated!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Prices 📈</h1>
          <p className="text-gray-500 mt-1">Real-time APMC prices and AI predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {districts.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prices">
            <BarChart3 className="w-4 h-4 mr-2" />
            Current Prices
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Price Trends
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Brain className="w-4 h-4 mr-2" />
            AI Predictions
          </TabsTrigger>
        </TabsList>

        {/* Current Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search commodity..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrices.map((price, index) => (
              <motion.div
                key={price.commodity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-all',
                    selectedCommodity === price.commodity && 'ring-2 ring-farmer-500'
                  )}
                  onClick={() => handleCommoditySelect(price.commodity)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{price.commodity}</h3>
                        <p className="text-xs text-gray-500">{price.market}</p>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
                        price.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {price.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(price.change)}%
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-farmer-600 mb-2">
                      ₹{price.modalPrice.toLocaleString()}<span className="text-sm font-normal text-gray-500">/quintal</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Min: ₹{price.minPrice}</span>
                      <span>Max: ₹{price.maxPrice}</span>
                      <span>{price.arrival} quintals</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Price Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCommodity} - Price Trend</CardTitle>
                  <CardDescription>Last 30 days in {selectedDistrict} APMC</CardDescription>
                </div>
                <Select value={selectedCommodity} onValueChange={handleCommoditySelect}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={(v, n) => [n === 'price' ? `₹${v}/quintal` : `${v} quintals`, n === 'price' ? 'Price' : 'Volume']} />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Price" />
                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Volume" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card className="bg-gradient-to-r from-farmer-50 to-blue-50 border-farmer-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-farmer-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">AI Price Prediction</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get AI-powered price forecasts based on historical APMC data, weather patterns, and market trends.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="farmer" onClick={handlePredictPrice} disabled={predicting}>
                      {predicting ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                      ) : (
                        <><Brain className="w-4 h-4 mr-2" />Predict Price</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {aiPrediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiPrediction.predictions.map(pred => {
                  const isUp = pred.price > aiPrediction.currentPrice
                  const changePercent = ((pred.price - aiPrediction.currentPrice) / aiPrediction.currentPrice * 100).toFixed(1)
                  return (
                    <Card key={pred.days}>
                      <CardContent className="p-5">
                        <p className="text-sm text-gray-500 mb-1">Next {pred.days} days</p>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          ₹{pred.price.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500">/quintal</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            isUp ? 'text-green-600' : 'text-red-600'
                          )}>
                            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {isUp ? '+' : ''}{changePercent}%
                          </div>
                          <Badge variant="outline">{pred.confidence}% confidence</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Recommendation */}
              <Card className={cn(
                'border-2',
                aiPrediction.recommendation.startsWith('HOLD') ? 'border-blue-300 bg-blue-50' : 'border-orange-300 bg-orange-50'
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Info className={cn('w-5 h-5 flex-shrink-0 mt-0.5',
                      aiPrediction.recommendation.startsWith('HOLD') ? 'text-blue-600' : 'text-orange-600'
                    )} />
                    <div>
                      <h4 className="font-semibold text-gray-900">AI Recommendation</h4>
                      <p className="text-sm text-gray-700 mt-1">{aiPrediction.recommendation}</p>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Based on:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiPrediction.factors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{factor}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MarketPrices