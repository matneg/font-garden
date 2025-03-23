
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, fonts } = useFontContext();
  
  // Get the project using the id from URL params
  const project = getProjectById(id || '');
  
  // Filter fonts that are used in this project (in a real app this would be a proper relationship)
  // For this demo, we'll just show some fonts
  const projectFonts = fonts.slice(0, project?.fontCount || 0);
  
  const handleEdit = () => {
    toast.info('Edit functionality will be implemented soon');
  };
  
  const handleDelete = () => {
    toast.info('Delete functionality will be implemented soon');
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
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Font
          </Button>
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add your first font
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
