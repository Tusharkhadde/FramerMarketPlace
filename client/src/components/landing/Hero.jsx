import React, { useState, useEffect } from 'react';
import { Leaf, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const backgroundImages = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1974',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1595856722026-b92476b7e51c?auto=format&fit=crop&q=80&w=1974',
  'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&q=80&w=1965'
];

const Hero = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background flex flex-col items-center font-body min-h-[80vh]">
      
      {/* Background Images Slider */}
      {backgroundImages.map((img, index) => (
        <div 
          key={img}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className={`absolute inset-0 transition-transform duration-[20s] ease-out ${
              index === currentImageIndex ? 'scale-110' : 'scale-100'
            }`}
            style={{
              backgroundImage: `url("${img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      ))}
      
      {/* Dark Overlays for Text Readability and Blending */}
      <div className="absolute inset-0 z-0 bg-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[1440px] h-full justify-center">
        
        {/* Main Content Area */}
        <div className="flex flex-col items-center text-center px-6 md:px-[120px] pt-32 pb-24 h-full justify-center w-full">
           
           {/* Badge Component */}
           <div 
             onClick={() => navigate('/products')}
             className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full p-1 pl-[5px] pr-4 gap-2 mb-8 shadow-sm hover:scale-105 transition-transform cursor-pointer backdrop-blur-sm"
           >
             <div className="bg-farmer-500 text-white flex items-center justify-center rounded-full px-2 py-1 gap-1 text-[12px] font-medium">
               <Leaf size={12} fill="currentColor"/> Local
             </div>
             <span className="text-sm text-zinc-300 font-medium tracking-wide">Fresh arrivals every morning</span>
           </div>

           {/* Main Headline */}
           <h1 className="text-foreground text-center mb-6 font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1]">
             Direct Farm Produce
           </h1>
           
           {/* Subtitle */}
           <p className="font-medium text-lg md:text-xl text-zinc-400 w-full max-w-2xl mb-12 leading-relaxed">
             Browse high-quality, organic products directly from trusted local farmers. Supporting sustainable agriculture and community health.
           </p>

           {/* Call to action buttons */}
           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
             <button 
               onClick={() => navigate('/products')}
               className="w-full sm:w-auto bg-farmer-600 hover:bg-farmer-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
             >
               <ShoppingBag size={20} />
               Shop Fresh Produce
             </button>
             <button 
               onClick={() => navigate('/register')}
               className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
             >
               Become a Farmer
               <ArrowRight size={20} />
             </button>
           </div>
           
           {/* Trust indicators */}
           <div className="mt-16 flex flex-wrap justify-center gap-8 text-zinc-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-farmer-500"></span>
                 100% Organic Certified
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-farmer-500"></span>
                 Verified Local Farmers
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-farmer-500"></span>
                 Secure Payments
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
