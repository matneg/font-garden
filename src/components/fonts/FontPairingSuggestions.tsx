
import React, { useState, useEffect } from 'react';
import { Font } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Sparkles, Link as LinkIcon, AlertTriangle, Info } from 'lucide-react';
import { loadGoogleFont, getFontStyle } from '@/lib/fontLoader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchFontPairings, FontPairingSuggestion } from '@/lib/openrouter';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface FontPairingSuggestionsProps {
  font: Font;
}

const FontPairingSuggestions: React.FC<FontPairingSuggestionsProps> = ({ font }) => {
  const [suggestions, setSuggestions] = useState<FontPairingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
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
    setDiagnosticInfo(null);
    setUsingFallback(false);
    setShowDiagnostics(false);
    
    try {
      if (!user) {
        setError('Please sign in to view font pairing suggestions.');
        return;
      }
      
      toast.info("Generating font pairing suggestions...");
      
      try {
        // Use the refactored fetchFontPairings function from openrouter.ts
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
        // Capture detailed diagnostic information for troubleshooting
        setDiagnosticInfo(JSON.stringify({
          timestamp: new Date().toISOString(),
          fontName: font.name,
          fontCategory: font.category,
          errorMessage: err.message,
          errorName: err.name,
          errorStack: err.stack,
          browserInfo: navigator.userAgent,
          origin: window.location.origin
        }, null, 2));
        
        // Check if fallback suggestions are available
        if (err.fallbackUsed && err.fallbackSuggestions) {
          console.log('Using fallback suggestions due to API error:', err.fallbackSuggestions);
          setSuggestions(err.fallbackSuggestions);
          setUsingFallback(true);
          setHasGenerated(true);
          
          // Store that we've generated for this font
          localStorage.setItem(storageKey, 'true');
          
          // Preload the fallback suggested fonts
          err.fallbackSuggestions.forEach((pair: FontPairingSuggestion) => {
            loadGoogleFont(pair.name);
          });
          
          toast.warning("Using offline font pairing suggestions due to connection issues.");
        } else {
          console.error('Error fetching font pairings:', err);
          setError(err.message || 'Failed to fetch font pairing suggestions.');
          toast.error("Failed to generate font pairings");
        }
      }
    } catch (err: any) {
      console.error('Error in handleFetchSuggestions:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error("Failed to generate font pairings");
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
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Generating Suggestions</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {diagnosticInfo && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="mb-2"
                >
                  <Info className="h-4 w-4 mr-2" />
                  {showDiagnostics ? 'Hide Diagnostic Info' : 'Show Diagnostic Info'}
                </Button>
                
                {showDiagnostics && (
                  <div className="bg-muted p-4 rounded-md mt-2 overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap">{diagnosticInfo}</pre>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleFetchSuggestions} variant="outline" size="sm">
                Try Again
              </Button>
              
              <Button 
                onClick={() => {
                  // Use fallback suggestions if an error occurs
                  const fallbacks = fallbackSuggestions[font.category.toLowerCase()] || defaultFallback;
                  setSuggestions(fallbacks);
                  setUsingFallback(true);
                  setHasGenerated(true);
                  setError(null);
                  
                  // Store that we've generated for this font
                  localStorage.setItem(storageKey, 'true');
                  
                  // Preload the fallback suggested fonts
                  fallbacks.forEach(pair => {
                    loadGoogleFont(pair.name);
                  });
                }} 
                variant="outline" 
                size="sm"
              >
                Use Offline Suggestions
              </Button>
            </div>
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
          <>
            {usingFallback && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Using offline suggestions</p>
                  <p className="mt-1">We couldn't connect to the AI service. These are curated suggestions for {font.category} fonts. Try refreshing later for personalized recommendations.</p>
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

// Import fallback suggestions from openrouter.ts
const fallbackSuggestions = {
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

const defaultFallback = fallbackSuggestions["sans-serif"];

export default FontPairingSuggestions;
