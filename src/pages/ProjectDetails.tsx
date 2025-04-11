
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFontContext } from '@/context/FontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2, Plus, FolderKanban, BookOpen, ExternalLink, Calendar, Clock, Maximize2 } from 'lucide-react';
import FontCard from '@/components/ui/FontCard';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import AddFontToProjectModal from '@/components/modals/AddFontToProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import { cn } from '@/lib/utils';
import { extractFirstUrl } from '@/utils/openGraph';
import ImageLightbox from '@/components/ui/ImageLightbox';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { getProjectById, fonts, deleteProject } = useFontContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [project, setProject] = useState(getProjectById(id || ''));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Refresh project when id changes
  useEffect(() => {
    setProject(getProjectById(id || ''));
  }, [id, getProjectById]);

  // Get all fonts associated with this project
  const projectFonts = project ? fonts.filter(font => {
    return font.projectCount && font.projectCount > 0;
  }).slice(0, project?.fontCount || 0) : []; // This is just a placeholder until we implement the real relation

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete the project');
    }
  };

  // Extract URL from description if it exists
  const projectUrl = project?.description ? extractFirstUrl(project.description) : null;
  
  // Collect all images from the project
  const allImages = React.useMemo(() => {
    if (!project) return [];
    
    const images = [];
    if (project.images && project.images.length > 0) {
      images.push(...project.images);
    }
    if (project.previewImageUrl && !images.includes(project.previewImageUrl)) {
      images.push(project.previewImageUrl);
    }
    return images;
  }, [project]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been removed</p>
          <Button asChild>
            <Link to="/projects">
              <FolderKanban className="mr-2 h-5 w-5" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Extract field from description - default to project name if not found
  const fieldMatch = project.description?.match(/Field:\s*([^\n]+)/);
  const field = fieldMatch ? fieldMatch[1].trim() : project.name.split(' ')[0];

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Back link */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
      
      {/* Project header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-md">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        <div className="flex gap-2">
          <EditProjectModal project={project} onSuccess={() => setProject(getProjectById(id || ''))}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </EditProjectModal>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Project Information Section */}
      <Card className="mb-10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-8">
            {/* Top row with fields */}
            <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-6">
                <Badge variant="outline" className={cn("text-sm py-1.5 px-4 rounded-full font-medium inline-flex w-fit", project.type === 'personal' ? "border border-blue-300 bg-blue-50 text-blue-700" : "border border-gray-300 bg-gray-100 text-gray-600")}>
                  {project.type === 'personal' ? 'Personal Project' : 'Reference'}
                </Badge>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mt-3 mb-1">Field</h3>
                  <p className="font-medium text-green-500">{field}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Authors</h3>
                <p className="font-medium">{project.name.split(' ')[0] || 'User'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Link section */}
            {projectUrl && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Link</h3>
                  <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline px-4 py-2 border rounded-md">
                    <ExternalLink className="h-4 w-4" />
                    {projectUrl}
                  </a>
                </div>
              </>
            )}
            
            {/* Images section */}
            {allImages.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Images:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {allImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video rounded-md overflow-hidden border group"
                      >
                        <img 
                          src={image} 
                          alt={`Project ${project.name} image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-background/80 hover:bg-background"
                            onClick={() => openLightbox(index)}
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            Full-screen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Fonts section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Fonts in this project</h2>
            <span className="text-muted-foreground">{projectFonts.length} fonts</span>
          </div>
          <AddFontToProjectModal projectId={project.id}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Font
            </Button>
          </AddFontToProjectModal>
        </div>
        <Separator className="mb-6" />
        
        {projectFonts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projectFonts.map(font => (
              <FontCard key={font.id} font={font} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">No fonts have been added to this project yet</p>
            <AddFontToProjectModal projectId={project.id}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add your first font
              </Button>
            </AddFontToProjectModal>
          </div>
        )}
      </div>

      {/* Lightbox Component */}
      {allImages.length > 0 && (
        <ImageLightbox 
          images={allImages}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.name}" and remove its association with all fonts.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetails;
