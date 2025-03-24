
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFontContext } from '@/context/FontContext';
import { Sprout, BookOpen, Upload, Search, FileText, CheckIcon, ChevronsUpDown, Loader2 } from 'lucide-react';
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
  notes: z.string().optional(),
  isCustom: z.boolean().default(false),
  googleFont: z.string().optional(),
});

type PlantFontFormValues = z.infer<typeof formSchema>;

interface PlantFontModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlantFontModal: React.FC<PlantFontModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { addFont } = useFontContext();
  const [fontSource, setFontSource] = useState<'google' | 'custom'>('google');
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontPreview, setFontPreview] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  
  const form = useForm<PlantFontFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fontFamily: '',
      category: 'sans-serif',
      notes: '',
      isCustom: false,
      googleFont: '',
    },
  });

  // Fetch Google Fonts from the API
  useEffect(() => {
    const fetchGoogleFonts = async () => {
      setLoadingFonts(true);
      try {
        const response = await fetch(
          'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch Google Fonts');
        }
        
        const data = await response.json();
        setGoogleFonts(data.items || []);
      } catch (error) {
        console.error('Error fetching Google Fonts:', error);
        // Fallback to the hardcoded list
        setGoogleFonts(FALLBACK_GOOGLE_FONTS.map(font => ({
          family: font.name,
          category: font.category,
          variants: ['regular']
        })));
      } finally {
        setLoadingFonts(false);
      }
    };

    fetchGoogleFonts();
  }, []);

  // Filter fonts based on search query
  const filteredFonts = googleFonts.filter(font => 
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Google Font selection
  const handleSelectGoogleFont = (font: GoogleFont) => {
    setSelectedFont(font.family);
    form.setValue('name', font.family);
    form.setValue('fontFamily', `${font.family}, ${font.category}`);
    form.setValue('category', font.category as FontCategory);
    form.setValue('isCustom', false);
    form.setValue('googleFont', font.family);
    setCommandOpen(false);
  };

  // Handle Custom Font File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFontFile(file);
      
      // Preview uploaded font
      const fileUrl = URL.createObjectURL(file);
      setFontPreview(fileUrl);
      
      // Try to extract name from filename (remove extension)
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      form.setValue('name', fontName);
      form.setValue('fontFamily', fontName);
      form.setValue('isCustom', true);
    }
  };

  // Update form based on font source
  useEffect(() => {
    if (fontSource === 'google') {
      form.setValue('isCustom', false);
    } else {
      form.setValue('isCustom', true);
    }
  }, [fontSource, form]);

  const onSubmit = async (values: PlantFontFormValues) => {
    // Create a new font object and save to Supabase
    await addFont({
      name: values.name,
      fontFamily: values.fontFamily,
      category: values.category as FontCategory,
      notes: values.notes || '',
      isCustom: values.isCustom,
      fontFilePath: fontFile ? URL.createObjectURL(fontFile) : null,
      fontFormat: fontFile ? determineFileFormat(fontFile.name) : null,
    });
    
    // Close the modal and reset the form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    form.reset();
    setSelectedFont(null);
    setSearchQuery('');
    setFontFile(null);
    setFontPreview(null);
    setCommandOpen(false);
  };

  // Helper to determine font format from filename
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

  // Fallback list of Google Fonts if API fails
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
                {/* Google Font Selector with Smart Suggestions */}
                <div className="space-y-4">
                  <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={commandOpen}
                        className="w-full justify-between"
                      >
                        {selectedFont
                          ? googleFonts.find(font => font.family === selectedFont)?.family
                          : "Search Google Fonts..."}
                        {loadingFonts ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search font..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>
                          {loadingFonts ? 'Loading fonts...' : 'No font found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandList className="max-h-[300px]">
                            {loadingFonts ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              filteredFonts.map((font) => (
                                <CommandItem
                                  key={font.family}
                                  value={font.family}
                                  onSelect={() => handleSelectGoogleFont(font)}
                                >
                                  <span className="font-medium">{font.family}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {font.category}
                                  </span>
                                  {selectedFont === font.family && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))
                            )}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedFont && (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <style>
                        @import url('https://fonts.googleapis.com/css2?family={selectedFont.replace(/\s+/g, '+')}:wght@400;700&display=swap');
                      </style>
                      <p className="text-lg" style={{ fontFamily: selectedFont }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Font: {selectedFont}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                {/* Custom Font Upload */}
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
                      <style dangerouslySetInnerHTML={{__html: `
                        @font-face {
                          font-family: "CustomFont";
                          src: url(${fontPreview});
                        }
                      `}} />
                      <p className="text-lg" style={{ fontFamily: 'CustomFont' }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" /> {fontFile?.name}
                      </p>
                    </div>
                  )}
                </div>

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
              </TabsContent>
              
              {/* Common Fields */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans-serif">Sans-serif</SelectItem>
                        <SelectItem value="display">Display</SelectItem>
                        <SelectItem value="handwriting">Handwriting</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
