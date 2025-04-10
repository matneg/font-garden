
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project, ProjectType } from '@/types';
import { useFontContext } from '@/context/FontContext';
import { PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { extractOpenGraphImage, extractFirstUrl } from '@/utils/openGraph';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projects, updateProject } = useFontContext();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setType(project.type || 'personal');
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if the description has a URL that might have an image
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
      
      const updatedProject = {
        ...project,
        name,
        description,
        type,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the details of your project
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description or paste a URL to automatically fetch an image"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Select
              value={type}
              onValueChange={(value: ProjectType) => setType(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
