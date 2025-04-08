import React, { useEffect } from 'react';
import { useFontContext } from '@/context/FontContext';

export const FontPreloader: React.FC = () => {
  const { fonts } = useFontContext();

  useEffect(() => {
    // Create a style element for custom fonts
    const style = document.createElement('style');
    let customFontFaces = '';

    // Process all fonts
    fonts.forEach(font => {
      if (!font.isCustom && font.fontFamily) {
        // Load Google Font
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.fontFamily.replace(/\s+/g, '+')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      } else if (font.isCustom && font.fontFilePath) {
        // Add @font-face for custom font
        const fontFormat = getFontFormat(font.fontFormat);
        const fontFamily = font.name.replace(/[^a-zA-Z0-9]/g, '');
        
        customFontFaces += `
          @font-face {
            font-family: "${fontFamily}";
            src: url("${font.fontFilePath}") format("${fontFormat}");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
      }
    });

    // Add all custom @font-face declarations at once
    if (customFontFaces) {
      style.textContent = customFontFaces;
      document.head.appendChild(style);
    }

    // Cleanup
    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [fonts]);

  return null;
};

function getFontFormat(format: string | null): string {
  if (!format) return 'truetype';
  
  switch (format) {
    case 'woff': return 'woff';
    case 'woff2': return 'woff2';
    case 'truetype': return 'truetype';
    case 'opentype': return 'opentype';
    case 'svg': return 'svg';
    case 'embedded-opentype': return 'embedded-opentype';
    default: return 'truetype';
  }
}
