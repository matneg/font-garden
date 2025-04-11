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
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Type Garden Font Pairing"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
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
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse the JSON from the response content
    const content = data.choices[0].message.content;
    try {
      const pairingSuggestions = JSON.parse(content);
      return pairingSuggestions;
    } catch (error) {
      console.error("Failed to parse font pairings JSON:", error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching font pairings:", error);
    return [];
  }
}
