
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full card-hover">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
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
