import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Bell, 
  ChevronRight, 
  Search, 
  Home, 
  LayoutGrid, 
  Users, 
  Clock, 
  Heart, 
  MessageSquare, 
  Settings,
  Flame,
  MapPin,
  MoreVertical
} from 'lucide-react';

const DashboardPreview = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mt-8 w-full max-w-5xl"
    >
      {/* Frosted glass wrapper with floating animation */}
      <motion.div 
        animate={{ 
          y: [0, -12, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="rounded-2xl overflow-hidden p-3 md:p-4 glass-premium"
      >
        {/* Dashboard internals */}
        <div className="bg-white rounded-xl overflow-hidden flex h-[600px] text-[11px] select-none pointer-events-none shadow-sm">
          {/* Sidebar */}
          <aside className="w-40 border-r border-border flex flex-col p-4 gap-6 shrink-0 bg-white">
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-[12px]">F</div>
              <span className="font-semibold text-foreground text-[13px]">FarmFresh</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { icon: Home, label: 'Home', active: true },
                { icon: LayoutGrid, label: 'Browse', badge: '250+' },
                { icon: Users, label: 'Farmers' },
                { icon: Clock, label: 'My Orders', arrow: true },
                { icon: Heart, label: 'Favorites' },
                { icon: MessageSquare, label: 'Messages', badge: '2' },
                { icon: Settings, label: 'Settings' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${item.active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] ${item.active ? '' : 'bg-muted'}`}>{item.badge}</span>}
                  {item.arrow && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </motion.div>
              ))}
            </nav>

            <motion.div variants={itemVariants} className="flex flex-col gap-2 mt-2">
              <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</span>
              <div className="flex flex-col gap-1">
                {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Organic'].map((cat, i) => (
                  <div key={i} className="px-2 py-1 text-muted-foreground">{cat}</div>
                ))}
              </div>
            </motion.div>
          </aside>

          {/* Main content */}
          <main className="flex-1 flex flex-col overflow-hidden bg-secondary/30">
            {/* Top bar */}
            <header className="h-12 border-b border-border flex items-center justify-between px-6 bg-white">
              <div className="flex-1 max-w-md">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <div className="w-full bg-muted/50 rounded-md py-1.5 pl-8 pr-12 text-muted-foreground flex items-center justify-between">
                    <span>Search products, farmers...</span>
                    <span className="bg-white border rounded px-1 text-[9px]">⌘K</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">3</span>
                </div>
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground border">JD</div>
              </div>
            </header>

            {/* Content areas */}
            <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h1 className="text-sm font-semibold">Good Morning, John</h1>
                
                {/* Action pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {['Browse All', 'Organic Only', 'Same Day', 'Deals', 'Local'].map((pill, i) => (
                    <motion.div 
                      key={i}
                      variants={itemVariants}
                      className={`${i === 0 ? 'bg-primary text-white' : 'bg-white border text-foreground'} px-3 py-1 rounded-full whitespace-nowrap`}
                    >
                      {pill}
                    </motion.div>
                  ))}
                  <div className="text-muted-foreground px-1">More</div>
                </div>
              </div>

              {/* Cards row */}
              <div className="flex gap-4">
                {/* Card 1 */}
                <motion.div variants={itemVariants} className="flex-1 bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-semibold text-[12px]">Trending Today</span>
                  </div>
                  <div className="flex flex-col divide-y">
                    {[
                      { name: 'Organic Carrots', weight: '5kg', price: '$12.50', star: '4.8' },
                      { name: 'Heirloom Tomatoes', weight: '3kg', price: '$18.00', star: '4.9' },
                      { name: 'Fresh Lettuce', weight: '2kg', price: '$8.50', star: '4.7' },
                    ].map((p, i) => (
                      <div key={i} className="py-2 flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted-foreground text-[10px]">{p.weight}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.price}</span>
                          <span className="text-yellow-500 text-[10px]">⭐ {p.star}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div variants={itemVariants} className="flex-1 bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-[12px]">Local Farmers</span>
                    <MoreVertical className="w-3 h-3 text-muted-foreground ml-auto" />
                  </div>
                  <div className="flex flex-col divide-y">
                    {[
                      { name: 'Green Valley Farm', dist: '2.3 km away' },
                      { name: 'Sunrise Dairy', dist: '5.1 km away' },
                      { name: 'Organic Orchards', dist: '8.7 km away' },
                    ].map((f, i) => (
                      <div key={i} className="py-3 flex justify-between items-center text-xs">
                        <span className="font-medium">{f.name}</span>
                        <span className="text-muted-foreground">{f.dist}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Orders area with chart */}
              <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <h2 className="font-semibold text-[12px]">Recent Orders</h2>
                  
                  {/* animated Chart */}
                  <div className="w-32 h-10 border-l border-b flex items-end">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        d="M0 35 C 10 32, 20 38, 30 30 C 40 22, 50 25, 60 18 C 70 12, 80 15, 90 8 L 100 5 L 100 40 L 0 40 Z" 
                        fill="url(#gradient)" 
                      />
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        d="M0 35 C 10 32, 20 38, 30 30 C 40 22, 50 25, 60 18 C 70 12, 80 15, 90 8 L 100 5" 
                        fill="none" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="1.5" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 text-[10px] uppercase font-semibold text-muted-foreground">
                        <th className="px-4 py-2 border-b">Order</th>
                        <th className="px-4 py-2 border-b">Product</th>
                        <th className="px-4 py-2 border-b">Farmer</th>
                        <th className="px-4 py-2 border-b">Amount</th>
                        <th className="px-4 py-2 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {[
                        { id: '#1024', p: 'Tomatoes (5kg)', f: 'Valley Farm', a: '$22.50', s: 'Processing', c: 'amber' },
                        { id: '#1023', p: 'Raw Milk (10L)', f: 'Sunrise Dairy', a: '$45.00', s: 'Delivered', c: 'green' },
                        { id: '#1022', p: 'Potatoes (15kg)', f: 'Green Fields', a: '$35.00', s: 'Delivered', c: 'green' },
                        { id: '#1021', p: 'Apples (8kg)', f: 'Orchard Co.', a: '$28.00', s: 'Delivered', c: 'green' },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{row.id}</td>
                          <td className="px-4 py-2">{row.p}</td>
                          <td className="px-4 py-2 font-medium">{row.f}</td>
                          <td className="px-4 py-2">{row.a}</td>
                          <td className="px-4 py-2">
                            <span className={`bg-${row.c}-50 text-${row.c}-600 px-2 py-0.5 rounded-full text-[9px] font-medium border border-${row.c}-100`}>{row.s}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPreview;
