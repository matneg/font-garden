
import React from 'react';
import { useFontContext } from '@/context/FontContext';
import ProjectCard from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, FolderKanban } from 'lucide-react';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import ProjectsSearchBar from '@/components/ui/ProjectsSearchBar';

const Projects = () => {
  const { filteredProjects, loading } = useFontContext();
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <FolderKanban className="mr-2 h-6 w-6" />
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage your font collections
          </p>
        </div>
        <CreateProjectModal>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> 
            Add Project
          </Button>
        </CreateProjectModal>
      </div>
      
      <ProjectsSearchBar />
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-muted h-40"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No projects found with your current filters</p>
              <CreateProjectModal>
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" /> 
                  Create a new project
                </Button>
              </CreateProjectModal>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Projects;
