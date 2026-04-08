import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  MapControlContainer,
} from "@/components/ui/map"
import { CircleIcon, MapPin, Navigation, Info, Search, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import api from '@/config/api'
import { MAHARASHTRA_DISTRICTS_COORDINATES, DEFAULT_MAHARASHTRA_CENTER } from '@/constants/locationConstants'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const STATUS_CLASS_NAME = {
  active: "text-green-500 fill-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]",
  inactive: "text-destructive fill-destructive",
  warning: "text-yellow-500 fill-yellow-500",
}

// Dummy data removed — fetching from DB now

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

const FarmMap = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState([19.0760, 72.8777]); // Default Mumbai
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?limit=100');
        // Map real product data to the format expected by FarmMap
        const realProducts = (response.data.data.products || []).map(p => {
          const baseCoords = MAHARASHTRA_DISTRICTS_COORDINATES[p.district] || DEFAULT_MAHARASHTRA_CENTER;
          return {
            id: p._id,
            name: p.cropName,
            farmer: p.farmer?.fullName || 'Unknown Farmer',
            district: p.district,
            village: p.village || '',
            // Add a small random offset if there are multiple products in the same district
            coordinates: [
              baseCoords[0] + (Math.random() - 0.5) * 0.05,
              baseCoords[1] + (Math.random() - 0.5) * 0.05
            ],
            status: p.isAvailable ? 'active' : 'inactive',
            speciality: p.category,
            price: p.pricePerKg,
            rating: p.ratings?.average || 4.5,
          };
        });
        setProducts(realProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.warn("Geolocation denied, using default.");
        }
      );
    }
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 overflow-hidden mt-4">
      {/* Sidebar List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col bg-card/40 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-border/50 bg-background/50">
          <h2 className="text-2xl font-black mb-4">Farm Map</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search farms, specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 rounded-full bg-muted/30 border-border/50 focus:bg-background/80 transition-all h-11 text-sm shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground mt-8 text-sm">No farms found.</p>
          ) : (
            filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className={cn(
                  "rounded-2xl border-border/40 hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer group shadow-sm bg-background/60",
                  selectedProduct?.id === product.id ? "border-primary shadow-md bg-primary/5" : ""
                )}
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <MapPin className="top-2 left-2 text-primary w-8 h-8 opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[15px] leading-tight text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.farmer}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm font-black text-primary">₹{product.price}<span className="text-[10px] text-muted-foreground font-medium">/kg</span></span>
                      <div className="flex items-center gap-1.5 bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
                        <Navigation className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground">{calculateDistance(userLocation[0], userLocation[1], product.coordinates[0], product.coordinates[1])} km</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-border/50 shadow-xl box-border bg-muted/20">
        <MapContainer 
          center={userLocation} 
          zoom={7} 
          scrollWheelZoom={true}
          className="h-full w-full z-10"
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User Location Marker */}
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              html: renderToStaticMarkup(
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 h-8 w-8 -m-2"></div>
                  <div className="bg-blue-600 rounded-full border-2 border-white h-4 w-4 shadow-lg shadow-blue-500/50"></div>
                </div>
              ),
              className: 'custom-user-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />

          {/* Farm Markers */}
          {filteredProducts.map((product) => (
            <Marker
              key={product.id}
              position={product.coordinates}
              icon={L.divIcon({
                html: renderToStaticMarkup(
                  <div className="relative group">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 border-background shadow-lg transition-transform group-hover:scale-125 z-10 relative",
                      selectedProduct?.id === product.id ? "bg-primary scale-125 shadow-primary/50" : "bg-muted-foreground/80"
                    )}></div>
                    {selectedProduct?.id === product.id && (
                       <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40 h-8 w-8 -m-2"></div>
                    )}
                  </div>
                ),
                className: 'custom-farm-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
              eventHandlers={{
                click: () => {
                  setSelectedProduct(product);
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[140px]">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none mb-1.5 rounded-full uppercase text-[9px] tracking-wider px-2 font-bold">Farm</Badge>
                  <h4 className="font-bold text-[16px] leading-tight text-slate-900 mb-0.5">{product.name}</h4>
                  <p className="text-[12px] text-slate-500 leading-snug">{product.district}{product.village ? `, ${product.village}` : ''}</p>
                  
                  <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-200">
                    <div>
                        <p className="text-[11px] text-slate-500 mb-0.5">Price</p>
                        <p className="text-sm font-black text-green-600">₹{product.price}<span className="text-[10px] text-slate-500 font-medium">/kg</span></p>
                    </div>
                    <Button size="sm" className="h-7 text-[11px] px-4 rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate(`/products/${product.id}`)}>
                      Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Product Floating View (like Google Maps) */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-6 right-6 w-72 z-[1001]"
            >
              <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/40 via-primary/20 to-background flex items-center justify-center relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8 bg-background/20 hover:bg-background/50 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                    <MapPin className="text-primary w-10 h-10 opacity-50" />
                </div>
                <CardContent className="p-5 pt-4">
                  <Badge className="bg-green-500/10 text-green-600 border-none mb-2 rounded-full uppercase text-[10px] tracking-widest font-bold">Available Now</Badge>
                  <h3 className="text-xl font-black text-foreground">{selectedProduct.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Grown by {selectedProduct.farmer}</p>
                  
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-muted/30 p-2.5 rounded-2xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Price</p>
                        <p className="text-sm font-black text-primary">₹{selectedProduct.price}<span className="text-[10px] font-medium text-muted-foreground">/kg</span></p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-2xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Distance</p>
                        <p className="text-sm font-black text-foreground">{calculateDistance(userLocation[0], userLocation[1], selectedProduct.coordinates[0], selectedProduct.coordinates[1])} km</p>
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-full shadow-lg h-11 font-bold" onClick={() => navigate(`/products/${selectedProduct.id}`)}>
                    View Product Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FarmMap
