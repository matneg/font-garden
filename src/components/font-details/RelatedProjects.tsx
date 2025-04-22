
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';

interface RelatedProjectsProps {
  projects: Project[];
}

const RelatedProjects = ({ projects }: RelatedProjectsProps) => {
  const displayProjects = projects.slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <LinkIcon className="mr-2 h-5 w-5" />
          Related Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayProjects.length > 0 ? (
          <ul className="space-y-3">
            {displayProjects.map(project => (
              <li key={project.id} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                <Link 
                  to={`/projects/${project.id}`}
                  className="text-sm hover:underline"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            This font is not used in any projects yet.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">View all projects</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RelatedProjects;
