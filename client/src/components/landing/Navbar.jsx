import React from 'react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body bg-transparent">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          🌾 FarmFresh
        </span>
      </div>

      {/* Right: Nav links and CTA */}
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Farmers</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
        </div>
        
        <Button 
          className="rounded-full px-5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Sell Your Harvest
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
