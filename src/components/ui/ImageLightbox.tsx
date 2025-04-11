
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageLightbox = ({ images, initialIndex = 0, open, onOpenChange }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reset index when images or initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, images]);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  const imageCount = images.length;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-screen h-screen p-0 border-none bg-black/90 backdrop-blur-md">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          
          {/* Main image container */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{ maxHeight: 'calc(100% - 100px)' }} // Leave space for thumbnails
              >
                <img 
                  src={images[currentIndex]} 
                  alt={`Image ${currentIndex + 1}`} 
                  className="max-w-full max-h-full object-contain transition-opacity duration-300"
                />
              </div>
            </div>
            
            {/* Navigation arrows - only show if there are multiple images */}
            {imageCount > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white h-12 w-12" 
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white h-12 w-12" 
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                  <span className="sr-only">Next</span>
                </Button>
              </>
            )}
          </div>
          
          {/* Thumbnails - only show if there are multiple images */}
          {imageCount > 1 && (
            <div className="w-full py-4 bg-black/70">
              <div className="flex justify-center items-center gap-2 px-10 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-14 overflow-hidden rounded-md border-2 transition-all duration-200",
                      currentIndex === index 
                        ? "border-primary brightness-100 scale-105" 
                        : "border-transparent brightness-50 hover:brightness-75"
                    )}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-white/70 text-sm mt-1">
                {currentIndex + 1} / {imageCount}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
