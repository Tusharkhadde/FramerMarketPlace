import React from 'react';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardPreview from './DashboardPreview';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    },
  };

  return (
    <div className="relative flex flex-col items-center w-full pt-16 pb-0 overflow-hidden min-h-screen">
      {/* Background Video with Mask */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Advanced overlays */}
        <div className="absolute inset-0 bg-white/20 backdrop-brightness-90"></div>
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      
      {/* Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center w-full px-6"
      >
        {/* 1. Badge */}
        <motion.div
          variants={itemVariants}
          className="group relative inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground font-body mb-8 overflow-hidden"
        >
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Fresh from local farms daily
          </span>
        </motion.div>

        {/* 2. Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-center font-display text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-tighter text-foreground max-w-3xl text-balance"
        >
          From Farm to <span className="italic font-display text-primary">Fresh</span> Table
        </motion.h1>

        {/* 3. Subheadline */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed font-body text-balance"
        >
          Connect directly with local farmers. Buy fresh, organic produce at fair prices while supporting sustainable agriculture in your community.
        </motion.p>

        {/* 4. CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button 
            className="rounded-full px-10 py-7 text-base font-semibold font-body bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            Browse Products
          </Button>
          <Button 
            variant="outline"
            className="rounded-full px-10 py-7 text-base font-semibold font-body border border-border bg-background/80 backdrop-blur-sm hover:bg-muted transition-all hover:border-primary/50"
          >
            <Sprout className="w-5 h-5 mr-2 text-primary" />
            I'm a Farmer
          </Button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Hero;
