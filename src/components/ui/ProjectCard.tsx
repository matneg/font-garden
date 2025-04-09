
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { Link } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { extractOpenGraphImage, extractFirstUrl } from '@/utils/openGraph';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      setImageError(false);
      
      try {
        // Priority 1: Check if the project has uploaded images
        if (project.images && project.images.length > 0) {
          console.log('Using uploaded image:', project.images[0]);
          setImageUrl(project.images[0]);
          return;
        }
        
        // Priority 2: Check if the project has a previewImageUrl already set
        if (project.previewImageUrl) {
          console.log('Using preview image URL:', project.previewImageUrl);
          setImageUrl(project.previewImageUrl);
          return;
        }
        
        // Priority 3: Extract image from external links in the description
        if (project.description) {
          // Try to extract links from the description
          const url = extractFirstUrl(project.description);
          if (url) {
            try {
              const ogImage = await extractOpenGraphImage(url);
              if (ogImage) {
                console.log('Using Open Graph image:', ogImage);
                setImageUrl(ogImage);
              }
            } catch (error) {
              console.error('Error fetching Open Graph image:', error);
              setImageError(true);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchImage:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [project]);

  // Handle image error
  const handleImageError = () => {
    console.log('Image failed to load, falling back to placeholder');
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
