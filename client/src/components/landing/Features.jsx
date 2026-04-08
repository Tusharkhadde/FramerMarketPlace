import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Users, Sprout } from 'lucide-react';

const features = [
  {
    title: 'Direct Trade',
    description: 'Farmers set their own prices and sell directly to you, ensuring better earnings for them and fairer prices for you.',
    icon: ShieldCheck,
    color: 'emerald',
  },
  {
    title: 'Quality Guaranteed',
    description: 'We partner with farmers who follow sustainable practices. Every product is checked for freshness and quality.',
    icon: Sprout,
    color: 'emerald',
  },
  {
    title: 'Community Driven',
    description: 'Support your local economy. Know exactly where your food comes from and the family that grew it.',
    icon: Users,
    color: 'emerald',
  },
  {
    title: 'Fast Delivery',
    description: 'Efficient logistics network ensures that produce moves from the farm to your table in the shortest time.',
    icon: Truck,
    color: 'emerald',
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6"
          >
            Why Choose <span className="text-emerald-400">FarmMarket</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 font-body leading-relaxed"
          >
            We're building a more transparent, sustainable, and rewarding food system for everyone involved.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-card border border-white/10 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 font-sans">{feature.title}</h3>
              <p className="text-white/80 font-body leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
