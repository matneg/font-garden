// src/lib/fontLoader.ts
import { Font } from '@/types';

// Keep track of loaded Google Fonts to avoid duplicate requests
const loadedGoogleFonts = new Set<string>();

// Keep track of loaded custom fonts to avoid duplicate style tags
const loadedCustomFonts = new Set<string>();

// Load a Google Font properly
export const loadGoogleFont = (fontFamily: string): void => {
  // Avoid loading the same font multiple times
  if (loadedGoogleFonts.has(fontFamily)) return;
  
  try {
    // Properly encode the font name for Google Fonts API
    const encodedFontFamily = fontFamily.replace(/\s+/g, '+');
    
    // Create link element
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodedFontFamily}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    
    // Add to document head
    document.head.appendChild(link);
    
    // Mark as loaded
    loadedGoogleFonts.add(fontFamily);
  } catch (error) {
    console.error(`Error loading Google Font ${fontFamily}:`, error);
  }
};

// Load a custom font using @font-face
export const loadCustomFont = (font: Font): void => {
  // Skip if already loaded or no path available
  if (loadedCustomFonts.has(font.name) || !font.fontFilePath) return;
  
  try {
    // Create unique font family name based on the font name
    const fontFamilyName = font.name.replace(/\s+/g, '');
    
    // Get format string for @font-face
    const formatString = getFormatString(font.fontFormat);
    
    // Create style element with @font-face
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: "${fontFamilyName}";
        src: url("${font.fontFilePath}") format("${formatString}");
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    
    // Mark as loaded
    loadedCustomFonts.add(font.name);
  } catch (error) {
    console.error(`Error loading custom font ${font.name}:`, error);
  }
};

// Get CSS format string based on font format
const getFormatString = (fontFormat: string | null): string => {
  if (!fontFormat) return 'truetype'; // Default to truetype
  
  switch (fontFormat) {
    case 'woff': return 'woff';
    case 'woff2': return 'woff2';
    case 'truetype': return 'truetype';
    case 'opentype': return 'opentype';
    case 'svg': return 'svg';
    case 'embedded-opentype': return 'embedded-opentype';
    default: return 'truetype';
  }
};

// Get font style object for a font
export const getFontStyle = (font: Font | undefined): React.CSSProperties => {
  if (!font) return {};
  
  if (font.isCustom) {
    if (!font.fontFilePath) return {};
    // Use font name as unique font family name
    const fontFamilyName = font.name.replace(/\s+/g, '');
    return { fontFamily: `"${fontFamilyName}", ${font.category}` };
  } else {
    if (!font.fontFamily) return {};
    return { fontFamily: `"${font.fontFamily}", ${font.category}` };
  }
};
