import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts'
import { Brain, TrendingUp, TrendingDown, Sparkles, AlertTriangle, Loader2, Calendar, MapPin, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/config/api'

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground text-sm">{entry.name}:</span>
            <span className="text-white font-bold">₹{entry.value}/quintal</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const PriceAdvisor = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [formData, setFormData] = useState({
    commodity: 'Tomato',
    district: 'Pune',
  })

  const fetchPrediction = async () => {
    if (!formData.commodity || !formData.district) {
      toast.error('Please enter both commodity and district')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/ai/predict-price', {
        commodity: formData.commodity,
        district: formData.district,
        daysAhead: 30
      })
      
      const predictionData = response.data.data
      
      // Transform data for recharts
      const chartData = [
        { day: 'Today', price: predictionData.currentPrice, type: 'actual' },
        ...predictionData.predictions.map(p => ({
          day: `+${p.days} Days`,
          price: p.price,
          type: 'predicted',
          confidence: p.confidence
        }))
      ]
      
      setData({ ...predictionData, chartData })
    } catch (error) {
      console.error(error)
      toast.error('Failed to get AI prediction')
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchPrediction()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            AI Price Advisor
          </h1>
          <p className="text-muted-foreground mt-1">
            Data-driven price predictions to help you maximize profits
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" /> Commodity
              </label>
              <Input 
                value={formData.commodity}
                onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                placeholder="e.g. Tomato, Onion"
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400" /> District
              </label>
              <Input 
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="e.g. Pune, Nashik"
                className="bg-black/50 border-white/10"
              />
            </div>
            <Button 
              onClick={fetchPrediction} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> Predict Prices</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Graph Area */}
            <Card className="lg:col-span-2 border-white/5 bg-[#0d0d0d]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{data.commodity} Price Trend</CardTitle>
                    <CardDescription>{data.district} APMC Markets</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-sm font-medium">Current Price:</span>
                    <span className="text-lg font-bold text-emerald-400">₹{data.currentPrice}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        stroke="#ffffff50" 
                        tick={{ fill: '#ffffff50', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff50" 
                        tick={{ fill: '#ffffff50', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x="Today" stroke="#ffffff30" strokeDasharray="3 3" />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation Sidebar */}
            <div className="space-y-6">
              {/* Primary Advice */}
              <Card className={`border-white/10 relative overflow-hidden ${
                data.trend === 'rising' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                'bg-rose-500/10 border-rose-500/20'
              }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 ${
                  data.trend === 'rising' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {data.trend === 'rising' ? (
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-500" />
                    )}
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {data.recommendation || data.aiAdvisor}
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Key Factors</h4>
                    {data.factors?.map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Confidence Metrics */}
              <Card className="bg-[#0d0d0d] border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" /> Model Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.predictions.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{p.days} Days Ahead</span>
                        <span className="font-medium">{p.confidence}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            p.confidence > 70 ? 'bg-emerald-500' : 
                            p.confidence > 40 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${p.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex items-start gap-3 text-xs text-muted-foreground bg-white/5 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p>
                      Predictions are based on historical regression models and seasonal trends. Always verify with local mandis before large transactions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PriceAdvisor
