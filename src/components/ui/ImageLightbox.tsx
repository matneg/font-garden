
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageLightbox = ({ images, initialIndex = 0, open, onOpenChange }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const imageCount = images.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-screen h-screen max-h-screen p-0 border-none bg-background/90 backdrop-blur-sm">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-50 rounded-full bg-background/50 hover:bg-background/90" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          
          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={images[currentIndex]} 
              alt={`Image ${currentIndex + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation controls */}
            {imageCount > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 z-50 rounded-full bg-background/50 hover:bg-background/90" 
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 z-50 rounded-full bg-background/50 hover:bg-background/90" 
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next</span>
                </Button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/50 px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {imageCount}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
