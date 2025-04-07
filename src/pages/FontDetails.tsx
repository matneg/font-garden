// Keep all the existing imports 
import { loadGoogleFont, loadCustomFont, getFontStyle } from '@/lib/fontLoader';

// In the component:
const FontDetails = () => {
  // Existing code...
  
  useEffect(() => {
    if (font) {
      if (font.isCustom) {
        loadCustomFont(font);
      } else if (font.fontFamily) {
        loadGoogleFont(font.fontFamily);
      }
    }
  }, [font]);
  
  // Replace getFontPreviewStyle function with:
  const getFontPreviewStyle = () => {
    return getFontStyle(font);
  };
  
  // Rest of the component stays the same
}
