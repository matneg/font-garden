
import React, { useState } from 'react';
import { useFontContext } from '@/context/FontContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Check, Plus, Search, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddFontToProjectModalProps {
  projectId: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddFontToProjectModal: React.FC<AddFontToProjectModalProps> = ({ 
  projectId, 
  children, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange 
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { fonts, getProjectById, addFontToProject } = useFontContext();
  
  const project = getProjectById(projectId);
  
  // If the component is controlled externally
  const isControlled = externalOpen !== undefined && externalOnOpenChange !== undefined;
  const isOpen = isControlled ? externalOpen : open;
  const onOpenChange = isControlled ? externalOnOpenChange : setOpen;
  
  const projectFonts = project ? fonts.filter(font => {
    // In a real implementation, this would filter fonts already in the project
    return font.projectCount && font.projectCount > 0;
  }).slice(0, project?.fontCount || 0) : [];
  
  // Filter fonts not already in the project and matching search query
  const availableFonts = fonts.filter(font => {
    // Check if the font is not already in the project
    const isInProject = projectFonts.some(pf => pf.id === font.id);
    // Check if the font name matches the search query
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
    return !isInProject && matchesSearch;
  });
  
  const handleAddFont = async (fontId: string) => {
    try {
      await addFontToProject(fontId, projectId);
      // No need to close the modal, so users can add multiple fonts
    } catch (error) {
      console.error('Error adding font to project:', error);
    }
  };
  
  return (
    <>
      {children && (
        <div onClick={() => onOpenChange(true)}>
          {children}
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <DialogTitle>Add Fonts to Project</DialogTitle>
            </div>
            <DialogDescription>
              Select fonts to add to "{project?.name || 'this project'}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center border rounded-md px-3 py-2 mb-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input 
              placeholder="Search fonts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            {availableFonts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No matching fonts found' : 'No available fonts to add'}
              </div>
            ) : (
              <div className="space-y-2">
                {availableFonts.map((font) => (
                  <div 
                    key={font.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{font.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {font.category} {font.isCustom && '• Custom'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddFont(font.id)}
                      className={cn("gap-1")}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddFontToProjectModal;
