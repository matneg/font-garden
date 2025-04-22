
// src/lib/openrouter.ts
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
    console.log(`Attempting to fetch font pairings for ${fontName} (${fontCategory})`);
    
    // Fetch API key from Supabase
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('name', 'openrouter')
      .single();
    
    if (keyError || !keyData) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Unable to access OpenRouter API key');
    }
    
    const API_KEY = keyData.key_value;
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    
    console.log(`Sending request to OpenRouter for font pairings for ${fontName} (${fontCategory})`);
    console.log('Origin:', window.location.origin);
    
    // Create a controller for the fetch request to enable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    try {
      // Test CORS with a preflight OPTIONS request
      const preflightResponse = await fetch(API_URL, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
        mode: 'cors',
        signal: controller.signal
      }).catch(err => {
        console.log('CORS preflight test failed:', err);
        return null;
      });
      
      if (preflightResponse) {
        console.log('CORS preflight response status:', preflightResponse.status);
        console.log('CORS preflight headers:', [...preflightResponse.headers.entries()]);
      }
      
      // Actual API request
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Font Garden Font Pairing",
          "OR-Site-URL": window.location.origin,
          "OR-App-Name": "FontGarden"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-exp-03-25:free",
          messages: [
            {
              role: "user",
              content: `You are a typography expert. Suggest 3 Google Font pairings for a ${fontCategory} font named "${fontName}". For each suggestion, explain why it pairs well. Respond in JSON format like this:
              [
                {
                  "name": "Font Name",
                  "category": "sans-serif/serif/display/etc",
                  "reason": "Brief explanation why this pairs well"
                },
                ...
              ]`
            }
          ],
          max_tokens: 600,
          temperature: 0.7
        }),
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('OpenRouter response status:', response.status);
      console.log('OpenRouter response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error (${response.status}):`, errorText);
        
        if (response.status === 402) {
          throw new Error('OpenRouter API credits depleted or payment required. Please check your OpenRouter account.');
        } else if (response.status === 403) {
          throw new Error('OpenRouter API access forbidden. Check API key permissions.');
        } else if (response.status === 429) {
          throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
        }
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OpenRouter API response:', data);
      
      // Parse the JSON from the response content
      const content = data.choices[0].message.content;
      try {
        // Sometimes AI models might return text before or after the JSON
        // Try to extract valid JSON using regex
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        
        const pairingSuggestions = JSON.parse(jsonStr);
        
        if (!Array.isArray(pairingSuggestions)) {
          console.error("API returned non-array response:", pairingSuggestions);
          throw new Error("API returned invalid format");
        }
        
        // Validate each suggestion has the required fields
        const validatedSuggestions = pairingSuggestions
          .filter(suggestion => 
            suggestion && 
            typeof suggestion === 'object' && 
            suggestion.name && 
            suggestion.category && 
            suggestion.reason
          )
          .map(suggestion => ({
            name: String(suggestion.name),
            category: String(suggestion.category),
            reason: String(suggestion.reason)
          }));
        
        if (validatedSuggestions.length === 0) {
          throw new Error("No valid font pairing suggestions found in the response");
        }
        
        console.log('Successfully parsed font pairings:', validatedSuggestions);
        return validatedSuggestions;
      } catch (error) {
        console.error("Failed to parse font pairings JSON:", error, "Raw content:", content);
        throw new Error("Failed to parse API response into valid font pairing suggestions");
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("Request timed out after 15 seconds");
        throw new Error('Request timed out. The server took too long to respond.');
      }
      
      // Enhanced network error reporting
      console.error("Network error details:", {
        error: fetchError,
        message: fetchError.message,
        type: fetchError.type,
        code: fetchError.code,
        stack: fetchError.stack
      });
      
      throw new Error(`Network error: ${fetchError.message}. This might be due to CORS restrictions or network connectivity issues.`);
    }
  } catch (error) {
    console.error("Error fetching font pairings:", error);
    
    // Return fallback suggestions based on the font category if available
    const fallbacks = fallbackSuggestions[fontCategory.toLowerCase()] || defaultFallback;
    console.log(`Using fallback suggestions for ${fontCategory} category:`, fallbacks);
    
    // Add note about using fallbacks in the error message
    error.fallbackUsed = true;
    error.fallbackSuggestions = fallbacks;
    throw error;
  }
}
