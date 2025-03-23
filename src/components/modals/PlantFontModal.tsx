
import React from 'react';
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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFontContext } from '@/context/FontContext';
import { Sprout, BookOpen } from 'lucide-react';
import { FontCategory } from '@/types';

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fontFamily: z.string().min(2, 'Font family must be at least 2 characters'),
  category: z.enum(['serif', 'sans-serif', 'display', 'handwriting', 'monospace', 'other'] as const),
  notes: z.string().optional(),
  isCustom: z.boolean().default(false),
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
  
  const form = useForm<PlantFontFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fontFamily: '',
      category: 'sans-serif',
      notes: '',
      isCustom: false,
    },
  });

  const onSubmit = async (values: PlantFontFormValues) => {
    // Create a new font object and save to Supabase
    await addFont({
      name: values.name,
      fontFamily: values.fontFamily,
      category: values.category as FontCategory,
      notes: values.notes || '',
      isCustom: values.isCustom,
      fontFilePath: null,
      fontFormat: null,
    });
    
    // Close the modal and reset the form
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-500" /> 
            <DialogTitle>Plant a Font</DialogTitle>
          </div>
          <DialogDescription>
            Add a new font to your collection. Watch it grow as you use it in projects!
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Inter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <FormControl>
                    <Input placeholder="Inter, sans-serif" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
              <Button type="submit" className="gap-2">
                <Sprout className="h-4 w-4" />
                Plant Font
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlantFontModal;
