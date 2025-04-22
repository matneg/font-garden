
// src/lib/openrouter.ts
import { supabase } from '@/integrations/supabase/client';

export interface FontPairingSuggestion {
  name: string;
  category: string;
  reason: string;
}

export async function fetchFontPairings(
  fontName: string, 
  fontCategory: string
): Promise<FontPairingSuggestion[]> {
  try {
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
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      
      if (response.status === 402) {
        throw new Error('OpenRouter API credits depleted or payment required. Please check your OpenRouter account.');
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
  } catch (error) {
    console.error("Error fetching font pairings:", error);
    throw error;
  }
}
