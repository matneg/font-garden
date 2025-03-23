
import React from 'react';
import { useFontContext } from '@/context/FontContext';
import GardenGrid from '@/components/garden/GardenGrid';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { fonts, loading } = useFontContext();
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <Leaf className="h-12 w-12 text-primary mr-2" />
          <h1 className="text-4xl md:text-5xl font-bold">Type Garden</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Your personal typography garden. Cultivate your collection and watch your fonts bloom.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/fonts/add">
              <PlusCircle className="mr-2 h-5 w-5" />
              Plant a Font
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/fonts">
              Browse Collection
            </Link>
          </Button>
        </div>
      </motion.div>
      
      <div className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Your Garden</h2>
          <Link to="/fonts" className="text-primary text-sm hover:underline">
            View all fonts
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse rounded-md bg-muted w-full max-w-3xl h-64"></div>
          </div>
        ) : (
          <GardenGrid fonts={fonts} />
        )}
      </div>
    </div>
  );
};

export default Index;
