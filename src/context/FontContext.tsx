
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Font, Project, FontCategory, ProjectType, FontFormat } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  addFont: (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'fontCount'>) => Promise<void>;
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
        .select('*, font_projects(font_id), type')
        .order('name');

      if (error) throw error;

      console.log('Fetched projects:', data);

      const transformedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        type: (project.type as ProjectType) || 'personal',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        fontCount: project.font_projects ? project.font_projects.length : 0
      }));

      setProjects(transformedProjects);
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

  const addFont = async (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to add a font');
        return;
      }
      
      // Check if the font already exists in the user's collection
      const isDuplicate = fonts.some(existingFont => {
        // For Google Fonts, check by font family name
        if (!font.isCustom && existingFont.fontFamily === font.fontFamily) {
          return true;
        }
        // For custom fonts, check by name since the font family might be formatted differently
        if (font.isCustom && existingFont.isCustom && existingFont.name === font.name) {
          return true;
        }
        return false;
      });

      if (isDuplicate) {
        toast.warning(`${font.name} is already in your Garden`);
        return;
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
      
      toast.success('Font added successfully!');
      await fetchFonts();
    } catch (err) {
      console.error('Error adding font:', err);
      toast.error('Failed to add font');
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
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          type: project.type || 'personal', // Ensure type is properly set
          user_id: userId
        })
        .select();

      if (error) throw error;
      
      toast.success('Project created successfully!');
      await fetchProjects();
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
