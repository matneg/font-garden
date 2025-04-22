
import { toast } from 'sonner';

export interface FontPairingSuggestion {
  name: string;
  category: string;
  reason: string;
}

// Fallback suggestions in case the API fails
export const fallbackSuggestions: Record<string, FontPairingSuggestion[]> = {
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
export const defaultFallback = fallbackSuggestions["sans-serif"];

export async function fetchFontPairings(
  fontName: string, 
  fontCategory: string
): Promise<FontPairingSuggestion[]> {
  try {
    const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.error("OpenRouter API key is not set");
      throw new Error("API key not configured");
    }
    
    const prompt = `
      I need font pairing suggestions for a font called "${fontName}" which belongs to the "${fontCategory}" category.
      Provide 3 font suggestions that would pair well with it.
      For each suggestion, include the font name, its category (serif, sans-serif, display, monospace, etc.), and a brief explanation of why it pairs well.
      Format your response as valid JSON with this structure:
      [
        {"name": "Font Name 1", "category": "font-category", "reason": "Explanation of why this pairs well"},
        {"name": "Font Name 2", "category": "font-category", "reason": "Explanation of why this pairs well"},
        {"name": "Font Name 3", "category": "font-category", "reason": "Explanation of why this pairs well"}
      ]
      Only include Google Fonts in your suggestions. Ensure the JSON is correctly formatted.
    `;

    console.log(`Fetching font pairings from OpenRouter for ${fontName} (${fontCategory})`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": window.location.origin, 
        "X-Title": "Font Garden"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenRouter API response:", data);
    
    // Extract the content from the response
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON from the content
    try {
      // Find JSON array in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        console.error("Could not find valid JSON in response content:", content);
        throw new Error("Could not find valid JSON in response");
      }
      
      const jsonString = jsonMatch[0];
      const suggestions = JSON.parse(jsonString);
      
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        console.error("Invalid suggestions format:", suggestions);
        throw new Error("Invalid suggestions format");
      }
      
      return suggestions.map(item => ({
        name: item.name,
        category: item.category,
        reason: item.reason
      }));
    } catch (parseError) {
      console.error("Error parsing OpenRouter response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse font pairing suggestions");
    }
  } catch (error) {
    console.error("Error fetching font pairings:", error);
    toast.error("Failed to generate font pairings from AI");
    
    // Return fallback suggestions for the specific font category
    const fallbacks = fallbackSuggestions[fontCategory.toLowerCase()] || defaultFallback;
    console.log(`Using fallback suggestions for ${fontCategory} category:`, fallbacks);
    
    return fallbacks;
  }
}
