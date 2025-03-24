
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFontContext } from '@/context/FontContext';
import { Sprout, BookOpen, Upload, Search, FileText } from 'lucide-react';
import { FontCategory, FontFormat } from '@/types';

// Popular Google Fonts - this would ideally come from an API
const POPULAR_GOOGLE_FONTS = [
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle Google Font selection
  const handleSelectGoogleFont = (font: { name: string, category: string }) => {
    setSelectedFont(font.name);
    form.setValue('name', font.name);
    form.setValue('fontFamily', `${font.name}, ${font.category}`);
    form.setValue('category', font.category as FontCategory);
    form.setValue('isCustom', false);
    form.setValue('googleFont', font.name);
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

  // Filter fonts based on search query
  const filteredFonts = POPULAR_GOOGLE_FONTS.filter(font => 
    font.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                {/* Google Font Selector */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search Google Fonts..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {selectedFont || "Select Font"} <BookOpen className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>Google Fonts</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {filteredFonts.length > 0 ? (
                            filteredFonts.map((font) => (
                              <DropdownMenuItem 
                                key={font.name}
                                onClick={() => handleSelectGoogleFont(font)}
                              >
                                {font.name}
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <DropdownMenuItem disabled>No fonts found</DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {selectedFont && (
                    <div className="p-4 border rounded-md bg-muted/50">
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
                      <style>
                        {`
                        @font-face {
                          font-family: "CustomFont";
                          src: url(${fontPreview});
                        }
                        `}
                      </style>
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
