// src/context/FontContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Font, Project, FontCategory, ProjectType, FontFormat } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractOpenGraphImage, extractFirstUrl } from '@/utils/openGraph';

interface FontContextType {
  fonts: Font[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  projectSearchQuery: string;
  categoryFilter: FontCategory | 'all';
  projectTypeFilter: ProjectType | 'all';
  projectSortOrder: 'newest' | 'oldest' | 'name-asc' | 'name-desc';
  setSearchQuery: (query: string) => void;
  setProjectSearchQuery: (query: string) => void;
  setCategoryFilter: (category: FontCategory | 'all') => void;
  setProjectTypeFilter: (type: ProjectType | 'all') => void;
  setProjectSortOrder: (order: 'newest' | 'oldest' | 'name-asc' | 'name-desc') => void;
  getFontById: (id: string) => Font | undefined;
  getProjectById: (id: string) => Project | undefined;
  addFont: (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => Promise<boolean | undefined>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'fontCount'>) => Promise<{ id: string } | undefined>;
  addFontToProject: (fontId: string, projectId: string) => Promise<void>;
  removeFontFromProject: (fontId: string, projectId: string) => Promise<void>;
  deleteFont: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  filteredProjects: Project[];
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<FontCategory | 'all'>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType | 'all'>('all');
  const [projectSortOrder, setProjectSortOrder] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');

  const fetchFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('fonts')
        .select('*, font_projects(project_id)')
        .order('name');

      if (error) throw error;

      const transformedFonts: Font[] = data.map(font => ({
        id: font.id,
        name: font.name,
        fontFamily: font.font_family,
        category: font.category as FontCategory,
        notes: font.notes || '',
        tags: font.tags || '',
        isCustom: font.is_custom,
        fontFilePath: font.font_file_path || null,
        fontFormat: font.font_format as FontFormat || null,
        createdAt: font.created_at,
        updatedAt: font.updated_at,
        projectCount: font.font_projects ? font.font_projects.length : 0
      }));

      setFonts(transformedFonts);
    } catch (err) {
      console.error('Error fetching fonts:', err);
      setError('Failed to load fonts');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, font_projects(font_id), type, images, preview_image_url')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched projects from database:', data);

      if (!data) return;

      const transformedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        type: (project.type as ProjectType) || 'personal',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        fontCount: project.font_projects ? project.font_projects.length : 0,
        images: project.images || [],
        previewImageUrl: project.preview_image_url || null
      }));

      console.log('Transformed projects:', transformedProjects);

      const projectsWithPreviewImage = await Promise.all(
        transformedProjects.map(async (project) => {
          if (!project.previewImageUrl && project.images && project.images.length > 0) {
            try {
              console.log(`Setting preview image for ${project.name} from images array:`, project.images[0]);
              
              await supabase
                .from('projects')
                .update({ preview_image_url: project.images[0] })
                .eq('id', project.id);
              
              return {
                ...project,
                previewImageUrl: project.images[0]
              };
            } catch (error) {
              console.error('Error updating preview image URL:', error);
            }
          }
          
          if (!project.previewImageUrl && project.description) {
            const url = extractFirstUrl(project.description);
            if (url) {
              console.log(`Trying to extract Open Graph image from URL for ${project.name}:`, url);
              try {
                const ogImage = await extractOpenGraphImage(url);
                if (ogImage) {
                  console.log(`Successfully extracted Open Graph image for ${project.name}:`, ogImage);
                  
                  await supabase
                    .from('projects')
                    .update({ preview_image_url: ogImage })
                    .eq('id', project.id);
                  
                  return {
                    ...project,
                    previewImageUrl: ogImage
                  };
                }
              } catch (error) {
                console.error('Error fetching Open Graph image:', error);
              }
            }
          }
          return project;
        })
      );

      setProjects(projectsWithPreviewImage);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFonts(), fetchProjects()]);
      setLoading(false);
    };

    fetchData();

    const fontsSubscription = supabase
      .channel('public:fonts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fonts' }, 
        () => fetchFonts())
      .subscribe();

    const projectsSubscription = supabase
      .channel('public:projects')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' }, 
        () => fetchProjects())
      .subscribe();

    const fontProjectsSubscription = supabase
      .channel('public:font_projects')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'font_projects' }, 
        () => {
          fetchFonts();
          fetchProjects();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(fontsSubscription);
      supabase.removeChannel(projectsSubscription);
      supabase.removeChannel(fontProjectsSubscription);
    };
  }, []);

  const getFontById = (id: string): Font | undefined => {
    return fonts.find(font => font.id === id);
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const addFont = async (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>): Promise<boolean | undefined> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to add a font');
        return false;
      }
      
      const isDuplicate = fonts.some(existingFont => {
        if (!font.isCustom && existingFont.fontFamily === font.fontFamily) {
          return true;
        }
        if (font.isCustom && existingFont.isCustom && existingFont.name === font.name) {
          return true;
        }
        return false;
      });

      if (isDuplicate) {
        toast.warning(`${font.name} is already in your Garden`);
        return false;
      }
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('fonts')
        .insert({
          name: font.name,
          font_family: font.fontFamily,
          category: font.category,
          notes: font.notes,
          tags: font.tags,
          is_custom: font.isCustom,
          font_file_path: font.fontFilePath,
          font_format: font.fontFormat,
          user_id: userId
        })
        .select();

      if (error) throw error;
      
      toast.success('Font planted successfully!');
      await fetchFonts();
      return true;
    } catch (err) {
      console.error('Error adding font:', err);
      toast.error('Failed to add font');
      return false;
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'fontCount'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to create a project');
        return;
      }
      
      const userId = session.user.id;
      
      let previewImageUrl = project.previewImageUrl;
      
      if (!previewImageUrl && !project.images?.length && project.description) {
        const url = extractFirstUrl(project.description);
        if (url) {
          console.log('Trying to extract Open Graph image from URL in new project:', url);
          try {
            const ogImage = await extractOpenGraphImage(url);
            if (ogImage) {
              console.log('Successfully extracted Open Graph image for new project:', ogImage);
              previewImageUrl = ogImage;
            }
          } catch (error) {
            console.error('Error fetching Open Graph image for new project:', error);
          }
        }
      }
      
      console.log('Creating project with data:', {
        name: project.name,
        description: project.description,
        type: project.type,
        images: project.images,
        previewImageUrl: previewImageUrl
      });
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          type: project.type || 'personal',
          user_id: userId,
          images: project.images || [],
          preview_image_url: previewImageUrl
        })
        .select();

      if (error) {
        console.error('Error in supabase insert:', error);
        throw error;
      }
      
      console.log('Project created successfully:', data);
      toast.success('Project created successfully!');
      await fetchProjects();
      
      if (data && data[0]) {
        return { id: data[0].id };
      }
    } catch (err) {
      console.error('Error adding project:', err);
      toast.error('Failed to create project');
    }
  };

  const addFontToProject = async (fontId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('font_projects')
        .insert([{
          font_id: fontId,
          project_id: projectId
        }]);

      if (error) throw error;
      
      toast.success('Font added to project!');
      await Promise.all([fetchFonts(), fetchProjects()]);
    } catch (err) {
      console.error('Error adding font to project:', err);
      toast.error('Failed to add font to project');
    }
  };

  const removeFontFromProject = async (fontId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('font_projects')
        .delete()
        .match({ font_id: fontId, project_id: projectId });

      if (error) throw error;
      
      toast.success('Font removed from project!');
      await Promise.all([fetchFonts(), fetchProjects()]);
    } catch (err) {
      console.error('Error removing font from project:', err);
      toast.error('Failed to remove font from project');
    }
  };

  const deleteFont = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fonts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Font deleted successfully!');
      await fetchFonts();
    } catch (err) {
      console.error('Error deleting font:', err);
      toast.error('Failed to delete font');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Project deleted successfully!');
      await fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = React.useMemo(() => {
    return projects
      .filter(project => {
        if (projectSearchQuery) {
          const searchTermLower = projectSearchQuery.toLowerCase();
          const matchesName = project.name.toLowerCase().includes(searchTermLower);
          const matchesDescription = project.description?.toLowerCase().includes(searchTermLower) || false;
          
          if (!matchesName && !matchesDescription) {
            return false;
          }
        }
        
        if (projectTypeFilter !== 'all') {
          return project.type === projectTypeFilter;
        }
        
        return true;
      })
      .sort((a, b) => {
        switch (projectSortOrder) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [projects, projectSearchQuery, projectTypeFilter, projectSortOrder]);

  return (
    <FontContext.Provider
      value={{
        fonts,
        projects,
        loading,
        error,
        searchQuery,
        projectSearchQuery,
        categoryFilter,
        projectTypeFilter,
        projectSortOrder,
        setSearchQuery,
        setProjectSearchQuery,
        setCategoryFilter,
        setProjectTypeFilter,
        setProjectSortOrder,
        getFontById,
        getProjectById,
        addFont,
        addProject,
        addFontToProject,
        removeFontFromProject,
        deleteFont,
        deleteProject,
        filteredProjects
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFontContext = (): FontContextType => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFontContext must be used within a FontProvider');
  }
  return context;
};
