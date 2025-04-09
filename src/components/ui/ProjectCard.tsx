// src/components/ui/ProjectCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { Link } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Debug what's coming in
    console.log('ProjectCard - project data:', project.name, {
      images: project.images,
      previewImageUrl: project.previewImageUrl
    });
    
    // Immediately try to use the images
    if (project.images && project.images.length > 0) {
      console.log('Using first image from images array:', project.images[0]);
      setImageUrl(project.images[0]);
      setIsLoading(false);
    } else if (project.previewImageUrl) {
      console.log('Using previewImageUrl:', project.previewImageUrl);
      setImageUrl(project.previewImageUrl);
      setIsLoading(false);
    } else {
      // No images available
      console.log('No images available for this project');
      setIsLoading(false);
    }
  }, [project]);

  // Handle image error
  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
    setImageUrl(null);
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full card-hover">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 mb-4 bg-muted/30 rounded-md overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <div className="animate-pulse w-8 h-8 rounded-full bg-muted"></div>
              </div>
            ) : imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt={`${project.name} preview`} 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="text-muted-foreground/50 w-12 h-12" />
              </div>
            )}
          </div>
          
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-3">
          {project.fontCount === 0 
            ? 'No fonts assigned' 
            : `${project.fontCount} ${project.fontCount === 1 ? 'font' : 'fonts'} assigned`}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
