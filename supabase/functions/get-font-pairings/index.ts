
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fontName, fontCategory } = await req.json();

    const prompt = `You are a typography expert. Given the font "${fontName}" (${fontCategory}), suggest 2 complementary fonts that would pair well with it. For each suggestion, explain why it works well. Format your response as JSON with this structure:
    {
      "suggestions": [
        {
          "fontName": "string",
          "category": "string",
          "explanation": "string"
        }
      ]
    }
    Keep explanations concise but informative. Focus on design principles and visual harmony.`;

    // Log request details for debugging
    console.log(`Making request to OpenRouter API with prompt about: ${fontName}`);
    
    try {
      const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.ai", 
          "X-Title": "Font Garden"
        },
        body: JSON.stringify({
          model: "gemini-pro", // Using a more reliable model
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenRouter API response:', JSON.stringify(data).substring(0, 200) + '...');
      
      let suggestions;
      try {
        suggestions = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing API response as JSON:', parseError);
        console.log('Raw content:', data.choices[0].message.content);
        
        // Attempt to extract JSON from text response
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse API response as JSON');
        }
      }

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (apiError) {
      console.error('API error:', apiError);
      // Return fallback suggestions in case of API error
      throw apiError;
    }
  } catch (error) {
    console.error('Error:', error);
    
    // Return graceful fallback with error message and suggestions
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [
          {
            fontName: "Playfair Display",
            category: "serif",
            explanation: "This elegant serif font creates a beautiful contrast while maintaining readability and sophistication."
          },
          {
            fontName: "Montserrat",
            category: "sans-serif",
            explanation: "This clean sans-serif font provides excellent readability and complements your primary font with its modern aesthetic."
          }
        ] 
      }),
      { 
        status: 200, // Return 200 but with error message and fallback suggestions
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
