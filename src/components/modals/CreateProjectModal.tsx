// src/components/modals/CreateProjectModal.tsx
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  ExternalLink, 
  Plus, 
  Calendar, 
  Check, 
  ChevronsUpDown, 
  Upload, 
  Image, 
  X, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { ProjectType } from '@/types';

const personalProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  month: z.string().optional(),
  year: z.string().optional(),
  duration: z.string().optional(),
  field: z.string().min(1, { message: "Field is required" }),
  coAuthors: z.string().optional(),
  externalLinks: z.string().optional(),
  projectImages: z.any().optional(),
});

const externalReferenceSchema = z.object({
  name: z.string().min(1, { message: "Reference name is required" }),
  month: z.string().optional(),
  year: z.string().optional(),
  duration: z.string().optional(),
  field: z.string().min(1, { message: "Field is required" }),
  authors: z.string().optional(),
  externalLinks: z.string().min(1, { message: "At least one external link is required" }),
  projectImages: z.any().optional(),
});

type PersonalProjectFormValues = z.infer<typeof personalProjectSchema>;
type ExternalReferenceFormValues = z.infer<typeof externalReferenceSchema>;

interface CreateProjectModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  children, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { addProject } = useFontContext();
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => (1900 + i).toString());

  const personalForm = useForm<PersonalProjectFormValues>({
    resolver: zodResolver(personalProjectSchema),
    defaultValues: {
      name: "",
      month: "",
      year: "",
      duration: "",
      field: "",
      coAuthors: "",
      externalLinks: "",
      projectImages: undefined,
    },
  });

  const externalForm = useForm<ExternalReferenceFormValues>({
    resolver: zodResolver(externalReferenceSchema),
    defaultValues: {
      name: "",
      month: "",
      year: "",
      duration: "",
      field: "",
      authors: "",
      externalLinks: "",
      projectImages: undefined,
    },
  });

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
    
    if (activeTab === 'personal') {
      personalForm.setValue('projectImages', selectedFiles);
    } else {
      externalForm.setValue('projectImages', selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    
    const newFiles = [...selectedFiles];
    const newPreviewUrls = [...previewUrls];
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    
    if (activeTab === 'personal') {
      personalForm.setValue('projectImages', newFiles);
    } else {
      externalForm.setValue('projectImages', newFiles);
    }
  };

  // UPDATED uploadImages function with better bucket handling
  const uploadImages = async (userId: string, projectId: string): Promise<string[] | null> => {
    if (selectedFiles.length === 0) return null;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      console.log('Starting image upload process...');
      
      // Check if we can access the bucket (don't try to create it - that requires admin rights)
      const { data: bucketList, error: listError } = await supabase.storage
        .from('project-images')
        .list();
      
      if (listError) {
        console.error('Error checking bucket access:', listError);
        toast.error('Unable to access storage. Please check storage permissions.');
        return null;
      }
      
      console.log('Successfully accessed project-images bucket');
      
      // Upload each file with a simpler path structure
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        // Simplified path - just use the filename directly
        const filePath = fileName;
        
        console.log(`Uploading file: ${fileName}`);
        
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error(`Failed to upload: ${file.name}`);
          continue;
        }
        
        console.log('File uploaded successfully, getting public URL...');
        
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);
          
        console.log('Public URL generated:', publicUrl);
        uploadedUrls.push(publicUrl);
      }
      
      if (uploadedUrls.length === 0) {
        toast.error('No images were successfully uploaded');
        return null;
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

  const onSubmitPersonal = async (values: PersonalProjectFormValues) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to create a project');
        return;
      }
      
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
      
      if (values.coAuthors) {
        description += `Co-authors: ${values.coAuthors}\n`;
      }
      
      if (values.externalLinks) {
        description += `External Links: ${values.externalLinks}\n`;
      }
      
      const result = await addProject({
        name: values.name,
        description: description.trim(),
        type: 'personal' as ProjectType,
      });
      
      if (result && result.id) {
        if (selectedFiles.length > 0) {
          console.log('Uploading images for project:', result.id);
          const imageUrls = await uploadImages(session.user.id, result.id);
          
          if (imageUrls && imageUrls.length > 0) {
            console.log('Updating project with image URLs:', imageUrls);
            
            const { error } = await supabase
              .from('projects')
              .update({ 
                images: imageUrls,
                preview_image_url: imageUrls[0]
              })
              .eq('id', result.id);
              
            if (error) {
              console.error('Error updating project with images:', error);
              toast.error('Failed to associate images with project');
            } else {
              console.log('Project updated with images successfully');
            }
          }
        }
        
        toast.success("Project created successfully!");
        setOpen(false);
        personalForm.reset();
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const onSubmitExternal = async (values: ExternalReferenceFormValues) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to add external references');
        return;
      }
      
      let description = "External Reference\n";
      
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
      
      if (values.authors) {
        description += `Authors: ${values.authors}\n`;
      }
      
      if (values.externalLinks) {
        description += `External Links: ${values.externalLinks}\n`;
      }
      
      const result = await addProject({
        name: values.name,
        description: description.trim(),
        type: 'reference' as ProjectType,
      });
      
      if (result && result.id) {
        if (selectedFiles.length > 0) {
          console.log('Uploading images for reference project:', result.id);
          const imageUrls = await uploadImages(session.user.id, result.id);
          
          if (imageUrls && imageUrls.length > 0) {
            console.log('Updating reference project with image URLs:', imageUrls);
            
            const { error } = await supabase
              .from('projects')
              .update({ 
                images: imageUrls,
                preview_image_url: imageUrls[0]
              })
              .eq('id', result.id);
              
            if (error) {
              console.error('Error updating reference with images:', error);
              toast.error('Failed to associate images with reference');
            } else {
              console.log('Reference updated with images successfully');
            }
          }
        }
        
        // Try to extract URLs and add as external references
        const links = values.externalLinks.split(",").map(link => link.trim());
        
        for (const url of links) {
          if (url) {
            const { error } = await supabase
              .from('external_references')
              .insert({
                url,
                project_name: values.name,
                user_id: session.user.id,
                project_id: result.id
              });
              
            if (error) {
              console.error("Error adding external reference:", error);
              toast.error("Failed to add external reference");
            }
          }
        }
        
        toast.success("External reference created successfully!");
        setOpen(false);
        externalForm.reset();
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    } catch (error) {
      console.error("Error creating external reference:", error);
      toast.error("Failed to create external reference");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
    setOpen(open);
  };

  const ComboboxFormField = ({ 
    form, 
    name, 
    label, 
    options, 
    placeholder 
  }: { 
    form: any, 
    name: string, 
    label: string, 
    options: string[], 
    placeholder: string 
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
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
                            setOpen(false);
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
                              setOpen(false);
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
                  {selectedFiles.length > 0 && ` (${selectedFiles.length} selected)`}
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
      
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
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
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                    Preview
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="personal" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Personal Project
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              External Reference
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <Form {...personalForm}>
              <form onSubmit={personalForm.handleSubmit(onSubmitPersonal)} className="space-y-4">
                <FormField
                  control={personalForm.control}
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
                    form={personalForm}
                    name="month"
                    label="Month"
                    options={months}
                    placeholder="Select month"
                  />
                  
                  <ComboboxFormField
                    form={personalForm}
                    name="year"
                    label="Year"
                    options={years}
                    placeholder="Select year"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
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
                    control={personalForm.control}
                    name="field"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field *</FormLabel>
                        <FormControl>
                          <Input placeholder="Web Design" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={personalForm.control}
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
                
                <FormField
                  control={personalForm.control}
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
                
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadingImages || personalForm.formState.isSubmitting}
                  >
                    {(uploadingImages || personalForm.formState.isSubmitting) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Personal Project
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="external" className="space-y-4">
            <Form {...externalForm}>
              <form onSubmit={externalForm.handleSubmit(onSubmitExternal)} className="space-y-4">
                <FormField
                  control={externalForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Design Magazine Article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <ComboboxFormField
                    form={externalForm}
                    name="month"
                    label="Month"
                    options={months}
                    placeholder="Select month"
                  />
                  
                  <ComboboxFormField
                    form={externalForm}
                    name="year"
                    label="Year"
                    options={years}
                    placeholder="Select year"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={externalForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="2 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={externalForm.control}
                    name="field"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field *</FormLabel>
                        <FormControl>
                          <Input placeholder="Typography" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={externalForm.control}
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
                
                <FormField
                  control={externalForm.control}
                  name="externalLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Links *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="https://example.com, https://design-magazine.com/article" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <ImageUploadField />
                
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadingImages || externalForm.formState.isSubmitting}
                  >
                    {(uploadingImages || externalForm.formState.isSubmitting) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create External Reference
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
