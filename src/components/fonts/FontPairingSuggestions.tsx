
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Font } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadGoogleFont } from '@/lib/fontLoader';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type FontPairing = {
  fontName: string;
  category: string;
  explanation: string;
};

type FontPairingSuggestionsProps = {
  font: Font;
};

const FontPairingSuggestions = ({ font }: FontPairingSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FontPairing[]>([]);

  const fetchSuggestions = async () => {
    if (suggestions.length > 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-font-pairings', {
        body: JSON.stringify({
          fontName: font.name,
          fontCategory: font.category
        })
      });

      if (error) throw error;

      const { suggestions } = data;
      setSuggestions(suggestions);

      // Preload suggested fonts
      suggestions.forEach(suggestion => {
        loadGoogleFont(suggestion.fontName);
      });

    } catch (err) {
      console.error('Error fetching font pairings:', err);
      setError('Failed to load font suggestions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchSuggestions();
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">AI Font Pairing</CardTitle>
              <CardDescription>
                Explore which other fonts work well with it
              </CardDescription>
            </div>
            <ChevronDown 
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} 
            />
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className={cn(
                  "py-4",
                  index !== suggestions.length - 1 && "border-b"
                )}
              >
                <h4 className="font-medium mb-2" style={{ fontFamily: suggestion.fontName }}>
                  {suggestion.fontName}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({suggestion.category})
                  </span>
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {suggestion.explanation}
                  </p>
                  <div 
                    className="p-4 bg-muted/30 rounded-md"
                    style={{ fontFamily: suggestion.fontName }}
                  >
                    <p className="text-xl mb-2">
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p style={{ fontFamily: font.fontFamily || font.name }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FontPairingSuggestions;
