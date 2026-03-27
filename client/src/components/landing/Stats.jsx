import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Farmers', value: '1,200+' },
  { label: 'Total Orders', value: '15,000+' },
  { label: 'Cities Covered', value: '50+' },
  { label: 'Customer Rating', value: '4.9/5' },
];

const Stats = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                {stat.value}
              </h2>
              <p className="text-sm font-body font-medium text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
