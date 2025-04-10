import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { Link } from 'react-router-dom';
import { ImageIcon, Link2Icon } from 'lucide-react';
import { extractOpenGraphImage, extractFirstUrl } from '@/utils/openGraph';
import { Badge } from '@/components/ui/badge';
interface ProjectCardProps {
  project: Project;
}
const ProjectCard: React.FC<ProjectCardProps> = ({
  project
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    const fetchImageForProject = async () => {
      setIsLoading(true);
      setImageError(false);

      // Debug what's coming in
      console.log('ProjectCard - project data:', project.name, {
        images: project.images,
        previewImageUrl: project.previewImageUrl,
        description: project.description
      });

      // Try to use the images in priority order
      if (project.images && project.images.length > 0) {
        console.log('Using first image from images array:', project.images[0]);
        setImageUrl(project.images[0]);
        setIsLoading(false);
      } else if (project.previewImageUrl) {
        console.log('Using previewImageUrl:', project.previewImageUrl);
        setImageUrl(project.previewImageUrl);
        setIsLoading(false);
      } else if (project.description) {
        // Try to extract a URL from the project description and fetch its Open Graph image
        const url = extractFirstUrl(project.description);
        if (url) {
          console.log('Trying to fetch Open Graph image from URL in description:', url);
          try {
            const ogImage = await extractOpenGraphImage(url);
            if (ogImage) {
              console.log('Successfully extracted Open Graph image:', ogImage);
              setImageUrl(ogImage);
            } else {
              console.log('No Open Graph image found');
              setImageUrl(null);
            }
          } catch (error) {
            console.error('Error fetching Open Graph image:', error);
            setImageUrl(null);
          }
        } else {
          console.log('No URL found in description');
          setImageUrl(null);
        }
        setIsLoading(false);
      } else {
        // No images available
        console.log('No images available for this project');
        setImageUrl(null);
        setIsLoading(false);
      }
    };
    fetchImageForProject();
  }, [project]);

  // Handle image error
  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
    setImageUrl(null);
  };

  // Extract URL from description for displaying link icon
  const hasExternalUrl = React.useMemo(() => {
    return !!extractFirstUrl(project.description || '');
  }, [project.description]);

  // Determine project type - default to 'personal' if not specified
  const projectType = project.type || 'personal';
  return <Link to={`/projects/${project.id}`}>
      <Card className="h-full card-hover">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{project.name}</CardTitle>
            {projectType === 'personal' ? <Badge variant="outline" className="bg-[#1EAEDB] text-white border border-white">
                Personal
              </Badge> : <Badge variant="secondary" className="text-white bg-slate-200">
                Reference
              </Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-40 mb-4 bg-muted/30 rounded-md overflow-hidden relative">
            {isLoading ? <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <div className="animate-pulse w-8 h-8 rounded-full bg-muted"></div>
              </div> : imageUrl && !imageError ? <img src={imageUrl} alt={`${project.name} preview`} className="w-full h-full object-cover" onError={handleImageError} /> : <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="text-muted-foreground/50 w-12 h-12" />
              </div>}
            
            {/* Show link icon for projects with external URLs */}
            {hasExternalUrl && <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                <Link2Icon className="w-4 h-4 text-primary" />
              </div>}
          </div>
          
          {project.description && <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-3">
          {project.fontCount === 0 ? 'No fonts assigned' : `${project.fontCount} ${project.fontCount === 1 ? 'font' : 'fonts'} assigned`}
        </CardFooter>
      </Card>
    </Link>;
};
export default ProjectCard;