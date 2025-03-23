import React from 'react';
import { Font } from '@/types';
import GardenItem from './GardenItem';
import { motion } from 'framer-motion';

interface GardenGridProps {
  fonts: Font[];
}

const GardenGrid: React.FC<GardenGridProps> = ({ fonts }) => {
  // Sort fonts: flowers first, then buds
  const sortedFonts = [...fonts].sort((a, b) => {
    // Sort by projectCount (descending)
    const countA = a.projectCount || 0;
    const countB = b.projectCount || 0;
    
    if (countA === 0 && countB === 0) {
      // If both are buds, sort alphabetically
      return a.name.localeCompare(b.name);
    }
    
    // Otherwise sort by project count
    return countB - countA;
  });
  
  // Calculate stats
  const flowerCount = fonts.filter(f => (f.projectCount || 0) > 0).length;
  const budCount = fonts.length - flowerCount;
  
  return (
    <div className="py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex gap-4 px-6 py-3 bg-muted/30 rounded-full">
          <div>
            <span className="text-lg font-medium">{flowerCount}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {flowerCount === 1 ? 'Flower' : 'Flowers'}
            </span>
          </div>
          <div className="h-6 w-px bg-muted-foreground/30"></div>
          <div>
            <span className="text-lg font-medium">{budCount}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {budCount === 1 ? 'Bud' : 'Buds'}
            </span>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {sortedFonts.map((font, index) => (
          <GardenItem key={font.id} font={font} index={index} />
        ))}
      </div>
      
      {fonts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your garden is empty. Start adding fonts to see them bloom!</p>
        </div>
      )}
    </div>
  );
};

export default GardenGrid;
