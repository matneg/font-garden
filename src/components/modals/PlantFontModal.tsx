import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFontContext } from '@/context/FontContext';
import { Sprout, Upload, FileText, ChevronsUpDown, Loader2, CheckIcon, X, Search } from 'lucide-react';
import { FontCategory, FontFormat } from '@/types';
import { cn } from '@/lib/utils';

// Define interface for Google Font data
interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
}

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fontFamily: z.string().min(2, 'Font family must be at least 2 characters'),
  category: z.enum(['serif', 'sans-serif', 'display', 'handwriting', 'monospace', 'other'] as const),
  tags: z.string().optional(),
  notes: z.string().optional(),
  isCustom: z.boolean().default(false),
  googleFont: z.string().optional(),
});

type PlantFontFormValues = z.infer<typeof formSchema>;

interface PlantFontModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY || "AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc";

const PlantFontModal: React.FC<PlantFontModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { addFont } = useFontContext();
  const [fontSource, setFontSource] = useState<'google' | 'custom'>('google');
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [selectedFontData, setSelectedFontData] = useState<GoogleFont | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontPreview, setFontPreview] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  
  const form = useForm<PlantFontFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fontFamily: '',
      category: 'sans-serif',
      tags: '',
      notes: '',
      isCustom: false,
      googleFont: '',
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchGoogleFonts = async () => {
      setLoadingFonts(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Google Fonts: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('Invalid response format from Google Fonts API');
        }
        
        console.log('Google Fonts API response:', { count: data.items.length, sample: data.items.slice(0, 3) });
        setGoogleFonts(data.items);
      } catch (error) {
        console.error('Error fetching Google Fonts:', error);
        // Fallback to the hardcoded list
        const fallbackFonts = FALLBACK_GOOGLE_FONTS.map(font => ({
          family: font.name,
          category: font.category,
          variants: ['regular']
        }));
        console.log('Using fallback fonts:', fallbackFonts);
        setGoogleFonts(fallbackFonts);
      } finally {
        setLoadingFonts(false);
      }
    };

    fetchGoogleFonts();
  }, []);

  const filteredFonts = googleFonts.filter(font => 
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFont = (font: GoogleFont) => {
    console.log("Font selected:", font.family, font.category);
    
    let category = font.category;
    if (!['serif', 'sans-serif', 'display', 'handwriting', 'monospace', 'other'].includes(category)) {
      category = 'other';
    }
    
    setSelectedFont(font.family);
    setSelectedFontData(font);
    
    form.setValue('name', font.family);
    form.setValue('fontFamily', `${font.family}, ${category}`);
    form.setValue('category', category as FontCategory);
    form.setValue('isCustom', false);
    form.setValue('googleFont', font.family);
    
    setDropdownOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFontFile(file);
      
      const fileUrl = URL.createObjectURL(file);
      setFontPreview(fileUrl);
      
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      form.setValue('name', fontName);
      form.setValue('fontFamily', fontName);
      form.setValue('isCustom', true);
    }
  };

  useEffect(() => {
    if (fontSource === 'google') {
      form.setValue('isCustom', false);
    } else {
      form.setValue('isCustom', true);
    }
  }, [fontSource, form]);

  const onSubmit = async (values: PlantFontFormValues) => {
    await addFont({
      name: values.name,
      fontFamily: values.fontFamily,
      category: values.category as FontCategory,
      notes: values.notes || '',
      tags: values.tags || '',
      isCustom: values.isCustom,
      fontFilePath: fontFile ? URL.createObjectURL(fontFile) : null,
      fontFormat: fontFile ? determineFileFormat(fontFile.name) : null,
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    form.reset();
    setSelectedFont(null);
    setSelectedFontData(null);
    setSearchQuery('');
    setFontFile(null);
    setFontPreview(null);
    setDropdownOpen(false);
  };

  const determineFileFormat = (filename: string): FontFormat | null => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'woff': return 'woff';
      case 'woff2': return 'woff2';
      case 'ttf': return 'truetype';
      case 'otf': return 'opentype';
      case 'svg': return 'svg';
      case 'eot': return 'embedded-opentype';
      default: return null;
    }
  };

  const FALLBACK_GOOGLE_FONTS = [
    { name: 'Roboto', category: 'sans-serif' },
    { name: 'Open Sans', category: 'sans-serif' },
    { name: 'Lato', category: 'sans-serif' },
    { name: 'Montserrat', category: 'sans-serif' },
    { name: 'Oswald', category: 'sans-serif' },
    { name: 'Source Sans Pro', category: 'sans-serif' },
    { name: 'Slabo 27px', category: 'serif' },
    { name: 'Raleway', category: 'sans-serif' },
    { name: 'PT Sans', category: 'sans-serif' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Playfair Display', category: 'serif' },
    { name: 'Poppins', category: 'sans-serif' },
    { name: 'Nunito', category: 'sans-serif' },
    { name: 'Nunito Sans', category: 'sans-serif' },
    { name: 'Ubuntu', category: 'sans-serif' },
    { name: 'JetBrains Mono', category: 'monospace' },
    { name: 'Dancing Script', category: 'handwriting' },
    { name: 'Pacifico', category: 'handwriting' },
    { name: 'Comic Neue', category: 'handwriting' },
    { name: 'Indie Flower', category: 'handwriting' },
    { name: 'Space Mono', category: 'monospace' },
    { name: 'Inconsolata', category: 'monospace' },
    { name: 'Bebas Neue', category: 'display' },
    { name: 'Bangers', category: 'display' },
  ];

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-500" /> 
            <DialogTitle>Plant a Font</DialogTitle>
          </div>
          <DialogDescription>
            Add a new font to your collection. Watch it grow as you use it in projects!
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="google" onValueChange={(value) => setFontSource(value as 'google' | 'custom')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">Google Fonts</TabsTrigger>
            <TabsTrigger value="custom">Upload Custom Font</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <TabsContent value="google" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full justify-between h-10"
                    >
                      {selectedFont 
                        ? `${selectedFont}`
                        : "Search Google Fonts..."}
                      {loadingFonts ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      )}
                    </Button>
                    
                    {dropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                        <div className="p-2 border-b flex items-center">
                          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search font..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          {searchQuery && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => setSearchQuery('')}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Clear</span>
                            </Button>
                          )}
                        </div>
                        
                        <ScrollArea className="h-[250px]">
                          <div className="py-1">
                            {loadingFonts ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : filteredFonts.length === 0 ? (
                              <div className="py-6 text-center text-muted-foreground">
                                No font found.
                              </div>
                            ) : (
                              filteredFonts.map((font) => (
                                <button
                                  key={font.family}
                                  type="button"
                                  className={cn(
                                    "w-full flex justify-between items-center px-3 py-2 text-sm hover:bg-muted",
                                    selectedFont === font.family && "bg-muted"
                                  )}
                                  onClick={() => handleSelectFont(font)}
                                >
                                  <span className="font-medium">{font.family}</span>
                                  <div className="flex items-center">
                                    <span className="text-xs text-muted-foreground mr-2">
                                      {font.category}
                                    </span>
                                    {selectedFont === font.family && (
                                      <CheckIcon className="h-4 w-4" />
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {selectedFont && selectedFontData && (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedFont}</span>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {selectedFontData.category}
                          </span>
                        </div>
                        <link 
                          href={`https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, '+')}:wght@400;700&display=swap`} 
                          rel="stylesheet" 
                        />
                        <p 
                          className="text-lg" 
                          style={{ 
                            fontFamily: `"${selectedFont}", ${selectedFontData.category || 'sans-serif'}` 
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".woff,.woff2,.ttf,.otf,.svg,.eot"
                      onChange={handleFileChange}
                    />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {fontFile ? (
                        <span className="text-primary font-medium">{fontFile.name}</span>
                      ) : (
                        <>
                          <span className="font-medium">Click to upload</span> or drag and drop<br />
                          WOFF, WOFF2, TTF, OTF, SVG, EOT
                        </>
                      )}
                    </p>
                  </div>

                  {fontPreview && (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          @font-face {
                            font-family: "CustomFont";
                            src: url(${fontPreview});
                          }
                        `
                      }} />
                      <p className="text-lg" style={{ fontFamily: 'CustomFont' }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" /> {fontFile?.name}
                      </p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Custom Font" {...field} />
                        </FormControl>
                        <FormDescription>
                          Name extracted from file, you can edit it if needed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., modern, display, favorite" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom tags separated by commas to organize your fonts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add some details about this font..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gap-2"
                  disabled={fontSource === 'google' && !selectedFont || fontSource === 'custom' && !fontFile}
                >
                  <Sprout className="h-4 w-4" />
                  Plant Font
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PlantFontModal;
