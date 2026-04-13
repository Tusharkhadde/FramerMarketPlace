import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  MapPin, 
  Leaf, 
  Zap, 
  CircleDashed,
  CalendarDays,
  CheckCircle2,
  TreeDeciduous,
  BadgeCheck,
  TrendingUp,
  History
} from 'lucide-react'
import { format } from 'date-fns'

const DigitalPassport = ({ passport, product }) => {
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!passport) return null

  const timelineEvents = [
    { 
      label: 'Crop Planted', 
      date: passport.traceability.planted, 
      icon: <Leaf className="w-4 h-4" />,
      color: 'bg-green-100 text-green-600'
    },
    { 
      label: 'Growth Verified', 
      date: passport.traceability.verified, 
      icon: <BadgeCheck className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      label: 'Fresh Harvested', 
      date: passport.traceability.harvested, 
      icon: <CalendarDays className="w-4 h-4" />,
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      label: 'Market Listing', 
      date: passport.traceability.listed, 
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-farmer-600" />
          Digital Crop Passport
        </h2>
        <div className="px-3 py-1 bg-farmer-100 text-farmer-700 rounded-full text-[10px] font-black tracking-widest uppercase">
          Traceability Verified
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Freshness Scan */}
        <div className="md:col-span-1">
          <div className="relative h-full p-6 rounded-[2rem] bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 shadow-xl overflow-hidden flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-farmer-500 border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-sm font-black text-zinc-500 uppercase tracking-tighter">AI Freshness Scan...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="verified"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-farmer-500 rounded-full flex items-center justify-center shadow-lg shadow-farmer-500/30">
                      <span className="text-3xl font-black text-white">{passport.aiAnalysis.freshnessScore}%</span>
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="font-black text-foreground">Verified Freshness</h3>
                    <p className="text-xs text-muted-foreground font-medium">AI analysis confirms Grade {product.qualityGrade} quality based on color, texture, and harvest timing.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Background Decorative Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-farmer-500/5 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Middle: Traceability Timeline */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-[2rem] bg-white border border-zinc-200 shadow-xl h-full">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-zinc-400" />
              <h3 className="font-black text-zinc-800 uppercase tracking-tight text-sm">Traceability Timeline</h3>
            </div>
            <div className="space-y-4">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== timelineEvents.length - 1 && (
                    <div className="absolute left-[18px] top-9 bottom-[-16px] w-[2px] bg-zinc-100" />
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm ${event.color}`}>
                    {event.icon}
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-black text-zinc-900 leading-none mb-1">{event.label}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{format(new Date(event.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Eco-Impact */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-[2rem] bg-farmer-900 text-white shadow-xl h-full relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <TreeDeciduous className="w-5 h-5 text-farmer-400" />
              <h3 className="font-black text-farmer-100 uppercase tracking-tight text-sm">Eco-Impact Score</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-black mb-1">-{passport.ecoImpact.co2Saved}kg</p>
                <p className="text-xs text-farmer-300 font-bold uppercase tracking-widest">CO2 OFFSET SAVED</p>
              </div>
              <div className="pt-4 border-t border-farmer-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-farmer-800 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-farmer-400" />
                  </div>
                  <p className="text-[11px] leading-snug font-medium text-farmer-100">
                    By choosing local, you saved over <span className="text-farmer-400 font-black">{passport.ecoImpact.transportKmSaved}km</span> of transport compared to traditional supply chains.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pattern Overlay */}
            <div className="absolute bottom-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
              <Leaf className="w-24 h-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigitalPassport
