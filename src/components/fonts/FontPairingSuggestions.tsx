import React, { useState, useEffect } from 'react';
import { Font } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Sparkles, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { loadGoogleFont, getFontStyle } from '@/lib/fontLoader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();

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
          "X-Title": "Type Garden Font Pairing"
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
      throw error;
    }
  }

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        setError('Please sign in to view font pairing suggestions.');
        return;
      }
      
      const pairings = await fetchFontPairings(font.name, font.category);
      setSuggestions(pairings);
      
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

  // Load suggestions when the component mounts and user is authenticated
  useEffect(() => {
    if (font && user) {
      handleFetchSuggestions();
    } else if (!user) {
      setError('Please sign in to view font pairing suggestions.');
    }
  }, [font.id, user]);

  // Get the current font style
  const currentFontStyle = getFontStyle(font);

  // Check if API keys table exists
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

  useEffect(() => {
    checkApiKeysTable();
  }, [user]);

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Font Pairing Suggestions
          </div>
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFetchSuggestions}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Refresh'}
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
