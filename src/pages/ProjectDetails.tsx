
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFontContext } from '@/context/FontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Plus,
  FolderKanban,
  BookOpen
} from 'lucide-react';
import FontCard from '@/components/ui/FontCard';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import AddFontToProjectModal from '@/components/modals/AddFontToProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, fonts, deleteProject, addFontToProject, removeFontFromProject } = useFontContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [project, setProject] = useState(getProjectById(id || ''));
  
  // Refresh project when id changes
  useEffect(() => {
    setProject(getProjectById(id || ''));
  }, [id, getProjectById]);
  
  // Get all fonts associated with this project
  const projectFonts = project ? fonts.filter(font => {
    // In a real implementation, this would use font_projects relation
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
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Back link */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 mb-4">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
      
      {/* Project header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className="flex gap-2">
          <EditProjectModal 
            project={project} 
            onSuccess={() => setProject(getProjectById(id || ''))}
          >
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </EditProjectModal>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Project metadata */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p>{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Font Count</h3>
              <p>{project.fontCount || 0} {project.fontCount === 1 ? 'font' : 'fonts'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Fonts section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Fonts in this project</h2>
          </div>
          <AddFontToProjectModal projectId={project.id}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Font
            </Button>
          </AddFontToProjectModal>
        </div>
        <Separator className="mb-6" />
        
        {projectFonts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projectFonts.map((font) => (
              <FontCard key={font.id} font={font} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">No fonts have been added to this project yet</p>
            <AddFontToProjectModal projectId={project.id}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add your first font
              </Button>
            </AddFontToProjectModal>
          </div>
        )}
      </div>

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
