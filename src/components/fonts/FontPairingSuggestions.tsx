import React, { useState, useEffect } from 'react';
import { Font } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { loadGoogleFont, getFontStyle } from '@/lib/fontLoader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface FontPairingSuggestion {
  name: string;
  category: string;
  reason: string;
}

interface FontPairingSuggestionsProps {
  font: Font;
}

const FontPairingSuggestions: React.FC<FontPairingSuggestionsProps> = ({ font }) => {
  const [suggestions, setSuggestions] = useState<FontPairingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { user } = useAuth();

  // IMPORTANT: We're using localStorage to remember if the component has already generated suggestions
  // This prevents auto-generation even on component remount
  const storageKey = `font-pairing-generated-${font.id}`;
  
  useEffect(() => {
    // Check localStorage to see if we've already generated for this font
    const hasGeneratedBefore = localStorage.getItem(storageKey) === 'true';
    setHasGenerated(hasGeneratedBefore);
    
    // Do NOT automatically generate, even if hasGeneratedBefore is true
    // This ensures we never auto-generate, even on page refresh
  }, [font.id, storageKey]);

  async function fetchFontPairings(fontName: string, fontCategory: string): Promise<FontPairingSuggestion[]> {
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
          "X-Title": "Type Garden Font Pairing",
          "OR-SITE-URL": window.location.origin,
          "OR-APP-NAME": "TypeGarden"
        },
        body: JSON.stringify({
          model: "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
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
          "max_tokens": 500
        })
      });
      
      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('OpenRouter API credits depleted or payment required. Please check your OpenRouter account.');
        }
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
      throw error;
    }
  }

  const handleFetchSuggestions = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        setError('Please sign in to view font pairing suggestions.');
        return;
      }
      
      // Use fallback pairings for testing without API calls
      // Remove this in production or when API is working
      /*
      const fallbackPairings = [
        {
          name: "Roboto",
          category: "sans-serif",
          reason: "Roboto's clean lines and neutral character balance well with the personality of the font."
        },
        {
          name: "Lora",
          category: "serif",
          reason: "Lora adds a touch of elegance and creates a nice contrast while maintaining readability."
        },
        {
          name: "Work Sans",
          category: "sans-serif",
          reason: "Work Sans has a friendly feel that complements the font without competing for attention."
        }
      ];
      
      // Comment this out when using real API
      setSuggestions(fallbackPairings);
      setHasGenerated(true);
      localStorage.setItem(storageKey, 'true');
      toast.success("Font pairing suggestions generated successfully!");
      
      // Preload the suggested fonts
      fallbackPairings.forEach(pair => {
        loadGoogleFont(pair.name);
      });
      */
      
      // Uncomment this for real API usage
      const pairings = await fetchFontPairings(font.name, font.category);
      setSuggestions(pairings);
      setHasGenerated(true);
      
      // Store that we've generated for this font
      localStorage.setItem(storageKey, 'true');
      
      // Preload the suggested fonts
      pairings.forEach(pair => {
        loadGoogleFont(pair.name);
      });
      
      toast.success("Font pairing suggestions generated successfully!");
    } catch (err: any) {
      console.error('Error fetching font pairings:', err);
      setError(err.message || 'Failed to fetch font pairing suggestions.');
      toast.error("Failed to generate font pairings");
    } finally {
      setLoading(false);
    }
  };

  // Get the current font style
  const currentFontStyle = getFontStyle(font);

  // Check if API keys table exists on component mount
  useEffect(() => {
    const checkApiKeysTable = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('api_keys')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking API keys table:', error);
          setError('API keys table not found. Please set up the API keys table in Supabase.');
        }
      } catch (err) {
        console.error('Error checking API keys table:', err);
      }
    };
    
    if (user) {
      checkApiKeysTable();
    }
  }, [user]);

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Font Pairing Suggestions
          </div>
          {user && hasGenerated && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFetchSuggestions}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Refresh Suggestions'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Asking AI for the best font pairings...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Sign in to see AI font pairing suggestions</p>
            <Button asChild variant="outline">
              <Link to="/auth/signin">Sign In</Link>
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={handleFetchSuggestions} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : !hasGenerated ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4 text-muted-foreground/40">
              <Sparkles className="h-16 w-16" />
            </div>
            <p className="text-muted-foreground mb-4">Discover perfect font pairings for your designs</p>
            <p className="text-sm text-muted-foreground/70 mb-6">Click "Generate Suggestions" to get AI-powered recommendations</p>
            <Button onClick={handleFetchSuggestions} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Suggestions
            </Button>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pairing suggestions available. Please try refreshing.
          </div>
        ) : (
          <ScrollArea className="max-h-[600px] pr-4">
            <div className="space-y-8">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 
                      className="text-xl font-medium"
                      style={{ fontFamily: `"${suggestion.name}", ${suggestion.category}` }}
                    >
                      {suggestion.name}
                    </h3>
                    <Badge variant="outline" className="capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <div className="bg-muted/30 p-6 rounded-md space-y-4">
                    <h4 
                      className="text-2xl" 
                      style={currentFontStyle}
                    >
                      {font.name} for headings
                    </h4>
                    <p 
                      className="text-base leading-relaxed" 
                      style={{ fontFamily: `"${suggestion.name}", ${suggestion.category}` }}
                    >
                      This is how text looks when {font.name} is paired with {suggestion.name}.
                      The combination creates a harmonious typography hierarchy for your designs.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Why this works:</strong> {suggestion.reason}
                  </div>
                  {index < suggestions.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default FontPairingSuggestions;
