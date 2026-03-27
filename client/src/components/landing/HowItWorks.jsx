import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Truck } from 'lucide-react';

const steps = [
  {
    title: 'Browse Fresh Produce',
    description: 'Explore a wide variety of seasonal fruits, vegetables, and organic products from local farms.',
    icon: Search,
  },
  {
    title: 'Order Directly',
    description: 'Place your order directly with the farmer. Supports various digital payment methods.',
    icon: ShoppingBag,
  },
  {
    title: 'Farm to Doorstep',
    description: 'Get fresh products delivered directly from the farm to your home within hours of harvesting.',
    icon: Truck,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold text-zinc-900 mb-4"
          >
            How it works
          </motion.h2>
          <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5 bg-zinc-100 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-white border-4 border-zinc-50 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-zinc-200/50 group-hover:border-emerald-100 transition-all duration-300">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <step.icon className="w-7 h-7" />
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Step {index + 1}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 font-display">{step.title}</h3>
                <p className="text-zinc-500 font-body text-sm leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
