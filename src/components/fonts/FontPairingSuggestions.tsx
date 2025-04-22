
import React, { useState, useEffect } from 'react';
import { Font } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { loadGoogleFont, getFontStyle } from '@/lib/fontLoader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchFontPairings, FontPairingSuggestion } from '@/lib/openrouter';
import { fallbackSuggestions, defaultFallback } from '@/lib/openrouter';

interface FontPairingSuggestionsProps {
  font: Font;
}

const FontPairingSuggestions: React.FC<FontPairingSuggestionsProps> = ({ font }) => {
  const [suggestions, setSuggestions] = useState<FontPairingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const { user } = useAuth();

  // Storage key for this specific font
  const storageKey = `font-pairing-generated-${font.id}`;
  
  useEffect(() => {
    // Check localStorage to see if we've already generated for this font
    const hasGeneratedBefore = localStorage.getItem(storageKey) === 'true';
    setHasGenerated(hasGeneratedBefore);
    
    // Do NOT automatically generate, even if hasGeneratedBefore is true
    // This ensures we never auto-generate, even on page refresh
  }, [font.id, storageKey]);

  const handleFetchSuggestions = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    
    try {
      if (!user) {
        setError('Please sign in to view font pairing suggestions.');
        return;
      }
      
      toast.info("Generating font pairing suggestions with AI...");
      
      // Get font pairings from the OpenRouter API
      const pairings = await fetchFontPairings(font.name, font.category);
      
      // Check if we're using fallbacks due to API error
      setUsingFallback(pairings === fallbackSuggestions[font.category.toLowerCase()] || 
                       pairings === defaultFallback);
      
      setSuggestions(pairings);
      setHasGenerated(true);
      
      // Store that we've generated for this font
      localStorage.setItem(storageKey, 'true');
      
      // Preload the suggested fonts
      pairings.forEach(pair => {
        loadGoogleFont(pair.name);
      });
      
      toast.success(usingFallback 
        ? "Using curated suggestions (API unavailable)" 
        : "AI font pairing suggestions generated successfully!");
      
    } catch (err: any) {
      console.error('Error in handleFetchSuggestions:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error("Failed to generate font pairings");
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-sm text-muted-foreground">Generating font pairing suggestions with AI...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Sign in to see AI font pairing suggestions</p>
            <Button asChild variant="outline">
              <Link to="/auth/signin">Sign In</Link>
            </Button>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              <p className="font-medium">Error generating suggestions</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            
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
            <p className="text-sm text-muted-foreground/70 mb-6">Click "Generate Suggestions" to get AI recommendations</p>
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
          <>
            {usingFallback && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Using offline suggestions</p>
                  <p className="mt-1">These are curated suggestions for {font.category} fonts. We're using a reliable offline database since the AI service is currently unavailable.</p>
                </div>
              </div>
            )}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FontPairingSuggestions;
