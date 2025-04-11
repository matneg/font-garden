// src/components/fonts/FontPairingSuggestions.tsx
import React, { useState, useEffect } from 'react';
import { Font } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { fetchFontPairings, FontPairingSuggestion } from '@/lib/openrouter';
import { loadGoogleFont, getFontStyle } from '@/lib/fontLoader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface FontPairingSuggestionsProps {
  font: Font;
}

const FontPairingSuggestions: React.FC<FontPairingSuggestionsProps> = ({ font }) => {
  const [suggestions, setSuggestions] = useState<FontPairingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pairings = await fetchFontPairings(font.name, font.category);
      setSuggestions(pairings);
      
      // Preload the suggested fonts
      pairings.forEach(pair => {
        loadGoogleFont(pair.name);
      });
      
      toast.success("Font pairing suggestions generated successfully!");
    } catch (err) {
      console.error('Error fetching font pairings:', err);
      setError('Failed to fetch font pairing suggestions.');
      toast.error("Failed to generate font pairings");
    } finally {
      setLoading(false);
    }
  };

  // Load suggestions when the component mounts
  useEffect(() => {
    if (font) {
      handleFetchSuggestions();
    }
  }, [font.id]);

  // Get the current font style
  const currentFontStyle = getFontStyle(font);

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Font Pairing Suggestions
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Asking AI for the best font pairings...</p>
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
