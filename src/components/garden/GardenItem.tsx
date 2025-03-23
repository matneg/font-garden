
import React from 'react';
import { Font } from '@/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface GardenItemProps {
  font: Font;
  index: number;
}

const GardenItem: React.FC<GardenItemProps> = ({ font, index }) => {
  const isFlower = (font.projectCount && font.projectCount > 0) || false;
  
  // Determine flower/bud color based on font category
  const getColorByCategory = (category: string): string => {
    switch(category) {
      case 'serif': return 'bg-purple-100 border-purple-200';
      case 'sans-serif': return 'bg-blue-100 border-blue-200';
      case 'display': return 'bg-pink-100 border-pink-200';
      case 'handwriting': return 'bg-yellow-100 border-yellow-200';
      case 'monospace': return 'bg-green-100 border-green-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };
  
  const colorClass = getColorByCategory(font.category);
  
  // Staggered animation delay based on index
  const delay = index * 0.1;
  
  return (
    <Link to={`/fonts/${font.id}`} className="block">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay,
          type: 'spring',
          stiffness: 100 
        }}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 } 
        }}
        className="relative flex flex-col items-center"
      >
        {/* Stem */}
        <div className="w-1 h-16 bg-garden-stem rounded-full mx-auto absolute bottom-[60px] z-0"></div>
        
        {/* Flower or bud */}
        <div className={`
          ${isFlower ? 'h-24 w-24' : 'h-16 w-16'} 
          ${colorClass}
          rounded-full flex items-center justify-center z-10
          border-2 shadow-md transition-all duration-300
          ${isFlower ? 'animate-pulse-gentle' : ''}
        `}>
          <span 
            className="text-xs font-medium truncate max-w-[80%] text-center"
            style={!font.isCustom ? { fontFamily: font.fontFamily || 'sans-serif' } : {}}
          >
            {font.name.substring(0, 10)}
            {font.name.length > 10 ? '...' : ''}
          </span>
        </div>
        
        {/* Flower details */}
        {isFlower && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            <p className="font-medium">{font.name}</p>
            <p>{font.projectCount} {font.projectCount === 1 ? 'project' : 'projects'}</p>
          </div>
        )}
        
        {/* Bud details */}
        {!isFlower && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            <p className="font-medium">{font.name}</p>
            <p>Unused</p>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default GardenItem;
