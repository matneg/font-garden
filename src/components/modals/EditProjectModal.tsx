import React, { useState, useEffect, useRef } from 'react';
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
  DialogTrigger,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project, ProjectType } from '@/types';
import { useFontContext } from '@/context/FontContext';
import { 
  PencilIcon, 
  Check, 
  ChevronsUpDown, 
  Upload, 
  X, 
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { extractOpenGraphImage, extractFirstUrl } from '@/utils/openGraph';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const projectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  month: z.string().optional(),
  year: z.string().optional(),
  duration: z.string().optional(),
  field: z.string().optional(),
  coAuthors: z.string().optional(),
  authors: z.string().optional(),
  externalLinks: z.string().optional(),
  projectImages: z.any().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface EditProjectModalProps {
  project: Project;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project,
  children,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const { updateProject } = useFontContext();

  // Extract data from description for form initialization
  const extractProjectData = (description: string) => {
    const data: Record<string, string> = {};
    const lines = description.split('\n');
    
    for (const line of lines) {
      if (line.includes('Field:')) {
        data.field = line.replace('Field:', '').trim();
      } else if (line.includes('Date:')) {
        const dateStr = line.replace('Date:', '').trim();
        const parts = dateStr.split(' ');
        if (parts.length === 2) {
          data.month = parts[0];
          data.year = parts[1];
        } else if (parts.length === 1) {
          // Check if it's a month or year
          if (!isNaN(Number(parts[0]))) {
            data.year = parts[0];
          } else {
            data.month = parts[0];
          }
        }
      } else if (line.includes('Duration:')) {
        data.duration = line.replace('Duration:', '').trim();
      } else if (line.includes('Co-authors:')) {
        data.coAuthors = line.replace('Co-authors:', '').trim();
      } else if (line.includes('Authors:')) {
        data.authors = line.replace('Authors:', '').trim();
      } else if (line.includes('External Links:')) {
        data.externalLinks = line.replace('External Links:', '').trim();
      }
    }
    
    return data;
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      month: "",
      year: "",
      duration: "",
      field: "",
      coAuthors: "",
      authors: "",
      externalLinks: "",
      projectImages: undefined,
    },
  });
  
  useEffect(() => {
    if (project && open) {
      // Reset form with project data
      form.reset({
        name: project.name,
        // Extract other fields from description
        ...extractProjectData(project.description || ""),
        projectImages: undefined,
      });
      
      // Set existing images
      if (project.images && project.images.length > 0) {
        setExistingImages(project.images);
      } else {
        setExistingImages([]);
      }
    }
    
    // Clean up preview URLs when modal closes
    return () => {
      if (!open) {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    };
  }, [project, open, form]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => (1900 + i).toString());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
        toast.error(`File ${file.name} is not a supported image format`);
        continue;
      }
      
      newFiles.push(file);
      
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    e.target.value = '';
    
    form.setValue('projectImages', selectedFiles);
  };

  const removeFile = (index: number) => {
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      
      const newFiles = [...selectedFiles];
      const newPreviewUrls = [...previewUrls];
      
      newFiles.splice(index, 1);
      newPreviewUrls.splice(index, 1);
      
      setSelectedFiles(newFiles);
      setPreviewUrls(newPreviewUrls);
      
      form.setValue('projectImages', newFiles);
    }
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const uploadImages = async (userId: string, projectId: string): Promise<string[] | null> => {
    if (selectedFiles.length === 0) return null;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      console.log('Starting image upload process...');
      
      // Upload each file with a simple filename
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        console.log(`Uploading file: ${fileName}`);
        
        // Try to upload directly to the bucket
        const { data, error } = await supabase.storage
          .from('project-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error('Error uploading image:', error);
          toast.error(`Failed to upload: ${file.name}`);
          continue;
        }
        
        console.log('File uploaded successfully, getting public URL...');
        
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
          
        console.log('Public URL generated:', publicUrl);
        uploadedUrls.push(publicUrl);
      }
      
      if (uploadedUrls.length === 0 && selectedFiles.length > 0) {
        toast.error('No images were successfully uploaded');
      }
      
      console.log('All uploads complete. URLs:', uploadedUrls);
      return uploadedUrls;
    } catch (error) {
      console.error('Error in image upload process:', error);
      toast.error('Failed to upload images');
      return uploadedUrls.length > 0 ? uploadedUrls : null;
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to update a project');
        return;
      }
      
      // Create description from form fields
      let description = "";
      
      if (values.field) {
        description += `Field: ${values.field}\n`;
      }
      
      if (values.month || values.year) {
        description += `Date: `;
        if (values.month) {
          description += `${values.month}`;
        }
        if (values.year) {
          description += values.month ? ` ${values.year}` : values.year;
        }
        description += "\n";
      }
      
      if (values.duration) {
        description += `Duration: ${values.duration}\n`;
      }
      
      if (project.type === 'personal' && values.coAuthors) {
        description += `Co-authors: ${values.coAuthors}\n`;
      }
      
      if (project.type === 'reference' && values.authors) {
        description += `Authors: ${values.authors}\n`;
      }
      
      if (values.externalLinks) {
        description += `External Links: ${values.externalLinks}\n`;
      }
      
      // Check if description has a URL that might have an image
      let previewImageUrl = project.previewImageUrl;
      const newUrl = extractFirstUrl(description);
      const oldUrl = extractFirstUrl(project.description || '');
      
      // If URL in description changed, try to fetch a new preview image
      if (newUrl && newUrl !== oldUrl) {
        try {
          const ogImage = await extractOpenGraphImage(newUrl);
          if (ogImage) {
            previewImageUrl = ogImage;
          }
        } catch (error) {
          console.error('Error fetching Open Graph image:', error);
        }
      }
      
      // Upload new images if any
      let newImageUrls: string[] | null = null;
      if (selectedFiles.length > 0) {
        newImageUrls = await uploadImages(session.user.id, project.id);
      }
      
      // Combine existing and new images
      const allImages = [
        ...existingImages,
        ...(newImageUrls || [])
      ];
      
      // If all images are removed and no new ones added, use a URL from description as preview
      if (allImages.length === 0 && previewImageUrl) {
        // Keep the existing preview image if it's from an OG tag
      } else if (allImages.length > 0) {
        // Use the first image as preview image
        previewImageUrl = allImages[0];
      }
      
      const updatedProject = {
        ...project,
        name: values.name,
        description: description.trim(),
        images: allImages,
        previewImageUrl
      };
      
      await updateProject(updatedProject);
      
      toast.success('Project updated successfully!');
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ComboboxFormField = ({ 
    name, 
    label, 
    options, 
    placeholder 
  }: { 
    name: "month" | "year", 
    label: string, 
    options: string[], 
    placeholder: string 
  }) => {
    const [comboboxOpen, setComboboxOpen] = useState(false);

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className={cn(
                      "w-full justify-between h-10 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandList>
                    <ScrollArea className="h-[200px]">
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            form.setValue(name, "");
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Clear selection
                        </CommandItem>
                        {options.map((option) => (
                          <CommandItem
                            key={option}
                            value={option}
                            onSelect={() => {
                              form.setValue(name, option, { shouldValidate: true });
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === option ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const ImageUploadField = () => (
    <div className="space-y-4">
      <div className="flex flex-col">
        <FormLabel>Project Images</FormLabel>
        <FormDescription>
          Upload images for your project (first image will be the preview)
        </FormDescription>
        
        <div className="mt-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
              <div className="flex flex-col items-center space-y-2 text-xs text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span>
                  Click to upload JPG, PNG, or WEBP
                  {(selectedFiles.length > 0 || existingImages.length > 0) && 
                    ` (${selectedFiles.length + existingImages.length} selected)`}
                </span>
              </div>
            </div>
            <input 
              id="image-upload" 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              multiple
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      
        {/* Existing images */}
        {existingImages.length > 0 && (
          <>
            <h4 className="mt-4 mb-2 text-sm font-medium">Existing Images</h4>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((url, index) => (
                <div key={url} className="relative group">
                  <img 
                    src={url} 
                    alt={`Existing ${index + 1}`} 
                    className="h-20 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && existingImages.length > 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                      Preview
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      
        {/* New images */}
        {previewUrls.length > 0 && (
          <>
            <h4 className="mt-4 mb-2 text-sm font-medium">New Images</h4>
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative group">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-20 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {existingImages.length === 0 && index === 0 && previewUrls.length > 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                      Preview
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the details of your project
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Font Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <ComboboxFormField
                name="month"
                label="Month"
                options={months}
                placeholder="Select month"
              />
              
              <ComboboxFormField
                name="year"
                label="Year"
                options={years}
                placeholder="Select year"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <FormControl>
                      <Input placeholder="Web Design" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {project.type === 'personal' ? (
              <FormField
                control={form.control}
                name="coAuthors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Co-authors</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe, Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="authors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe, Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="externalLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Links</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="https://example.com, https://myportfolio.com/project" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ImageUploadField />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting || uploadingImages}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || uploadingImages}
              >
                {(isSubmitting || uploadingImages) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
