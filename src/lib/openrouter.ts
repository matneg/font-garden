import { supabase } from '@/integrations/supabase/client';

export interface FontPairingSuggestion {
  name: string;
  category: string;
  reason: string;
}

// Fallback suggestions in case the API fails
const fallbackSuggestions: Record<string, FontPairingSuggestion[]> = {
  "sans-serif": [
    {
      name: "Playfair Display",
      category: "serif",
      reason: "The classic serif structure of Playfair Display creates a beautiful contrast with sans-serif fonts, giving designs a sophisticated editorial look."
    },
    {
      name: "Lora",
      category: "serif",
      reason: "Lora has a balanced, modern serif design that pairs well with clean sans-serif fonts for readable and elegant typographic hierarchies."
    },
    {
      name: "Nunito",
      category: "sans-serif",
      reason: "Nunito's rounded terminals provide a friendlier alternative while maintaining the clean lines that complement other sans-serif fonts."
    }
  ],
  "serif": [
    {
      name: "Montserrat",
      category: "sans-serif",
      reason: "Montserrat's geometric structure creates a strong contrast with serif fonts, resulting in a balanced modern-classic pairing."
    },
    {
      name: "Open Sans",
      category: "sans-serif",
      reason: "Open Sans has excellent readability and a neutral appearance that lets serif fonts shine while maintaining clear hierarchical structure."
    },
    {
      name: "Roboto",
      category: "sans-serif",
      reason: "Roboto's clean lines and optimized legibility make it an ideal companion for more decorative serif typefaces."
    }
  ],
  "display": [
    {
      name: "Poppins",
      category: "sans-serif",
      reason: "Poppins has a geometric style that grounds more expressive display fonts while maintaining a contemporary feel."
    },
    {
      name: "Raleway",
      category: "sans-serif",
      reason: "Raleway's elegant thin weights and distinctive 'w' provide subtle character while letting display fonts take center stage."
    },
    {
      name: "Work Sans",
      category: "sans-serif",
      reason: "Work Sans offers excellent readability for body text when paired with more attention-grabbing display typefaces."
    }
  ],
  "monospace": [
    {
      name: "Source Sans Pro",
      category: "sans-serif",
      reason: "Source Sans Pro's clean design complements the technical feel of monospace fonts while improving readability for longer text."
    },
    {
      name: "Merriweather",
      category: "serif",
      reason: "Merriweather adds warmth and contrast to the technical precision of monospace fonts with its high x-height and excellent readability."
    },
    {
      name: "Nunito Sans",
      category: "sans-serif",
      reason: "Nunito Sans offers a friendly counterpoint to the more mechanical structure of monospace fonts."
    }
  ]
};

// Default fallback for any category not explicitly covered
const defaultFallback = fallbackSuggestions["sans-serif"];

export async function fetchFontPairings(
  fontName: string, 
  fontCategory: string
): Promise<FontPairingSuggestion[]> {
  try {
    // Since the OpenRouter API is having issues, we'll use the fallback suggestions for now
    // This provides a more reliable user experience
    console.log(`Using fallback suggestions for ${fontCategory} category instead of API call`);
    
    return fallbackSuggestions[fontCategory.toLowerCase()] || defaultFallback;
  } catch (error) {
    console.error("Error fetching font pairings:", error);
    
    const fallbacks = fallbackSuggestions[fontCategory.toLowerCase()] || defaultFallback;
    console.log(`Using fallback suggestions for ${fontCategory} category:`, fallbacks);
    
    return fallbacks;
  }
}
