import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { formatPrice, getProductImageUrl } from '@/lib/utils';
import Loading from '@/components/shared/Loading';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?limit=8'); // Fetch top 8 featured products
        setProducts(response.data.data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-background border-t border-border/10">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <Loading />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-background border-y border-border/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
            >
              Fresh Arrivals
            </motion.h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto md:mx-0">
              Discover the latest high-quality organic produce straight from local farms to your table.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex items-center gap-2 hover:bg-farmer-600 hover:text-white transition-colors border-border font-body"
            onClick={() => navigate('/products')}
          >
            View All Marketplace <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card border-border/40 hover:border-farmer-500/50"
                onClick={() => navigate(`/products/${product._id}`)}>
                <div className="relative overflow-hidden">
                  <img
                    src={getProductImageUrl(product.images?.[0]?.url)}
                    alt={product.cropName}
                    className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {product.isOrganic && (
                    <span className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                      Organic
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full backdrop-blur-md font-medium shadow-sm ${product.qualityGrade === 'A' ? 'bg-farmer-500/90 text-white' :
                      product.qualityGrade === 'B' ? 'bg-yellow-500/90 text-white' :
                        'bg-zinc-500/90 text-white'
                    }`}>
                    Grade {product.qualityGrade}
                  </span>
                </div>
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground mb-3 flex items-center uppercase tracking-wider font-semibold">
                    <MapPin className="w-3 h-3 mr-1 text-farmer-500" />
                    {product.district || 'Local Area'}
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-4 truncate font-body">
                    {product.cropName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-foreground">
                        {formatPrice(product.pricePerKg)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">/kg</span>
                    </div>
                    {product.ratings?.average > 0 && (
                      <div className="flex items-center px-1.5 py-1 rounded text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span className="text-sm font-medium">{product.ratings.average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-10 md:hidden flex items-center justify-center gap-2 border-border"
          onClick={() => navigate('/products')}
        >
          View All Marketplace <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
