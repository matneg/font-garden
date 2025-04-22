
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fontName, fontCategory } = await req.json()

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.ai", 
        "X-Title": "Font Garden"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro-exp-03-25:free",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
