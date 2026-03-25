import React from 'react';
import Hero from '@/components/landing/Hero';

const Home = () => {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-body">
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
};

export default Home;