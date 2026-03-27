import React from 'react';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Stats from '@/components/landing/Stats';

const Home = () => {
  return (
    <div className="flex flex-col bg-background font-body">
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
      </main>
    </div>
  );
};

export default Home;