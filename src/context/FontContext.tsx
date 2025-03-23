
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Font, Project, FontCategory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FontContextType {
  fonts: Font[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: FontCategory | 'all';
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: FontCategory | 'all') => void;
  getFontById: (id: string) => Font | undefined;
  getProjectById: (id: string) => Project | undefined;
  addFont: (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'fontCount'>) => Promise<void>;
  addFontToProject: (fontId: string, projectId: string) => Promise<void>;
  removeFontFromProject: (fontId: string, projectId: string) => Promise<void>;
  deleteFont: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<FontCategory | 'all'>('all');

  // Fetch fonts from Supabase
  const fetchFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('fonts')
        .select('*, font_projects(project_id)')
        .order('name');

      if (error) throw error;

      // Transform data to match Font interface
      const transformedFonts: Font[] = data.map(font => ({
        id: font.id,
        name: font.name,
        fontFamily: font.font_family,
        category: font.category,
        notes: font.notes || '',
        isCustom: font.is_custom,
        fontFilePath: font.font_file_path || null,
        fontFormat: font.font_format || null,
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

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, font_projects(font_id)')
        .order('name');

      if (error) throw error;

      // Transform data to match Project interface
      const transformedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
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

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFonts(), fetchProjects()]);
      setLoading(false);
    };

    fetchData();

    // Set up real-time subscriptions
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

    // Cleanup subscriptions
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

  // Add a new font
  const addFont = async (font: Omit<Font, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => {
    try {
      const { data, error } = await supabase
        .from('fonts')
        .insert([{
          name: font.name,
          font_family: font.fontFamily,
          category: font.category,
          notes: font.notes,
          is_custom: font.isCustom,
          font_file_path: font.fontFilePath,
          font_format: font.fontFormat
        }])
        .select();

      if (error) throw error;
      
      toast.success('Font added successfully!');
      await fetchFonts();
    } catch (err) {
      console.error('Error adding font:', err);
      toast.error('Failed to add font');
    }
  };

  // Add a new project
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'fontCount'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: project.name,
          description: project.description
        }])
        .select();

      if (error) throw error;
      
      toast.success('Project created successfully!');
      await fetchProjects();
    } catch (err) {
      console.error('Error adding project:', err);
      toast.error('Failed to create project');
    }
  };

  // Add a font to a project
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

  // Remove a font from a project
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

  // Delete a font
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

  // Delete a project
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

  return (
    <FontContext.Provider
      value={{
        fonts,
        projects,
        loading,
        error,
        searchQuery,
        categoryFilter,
        setSearchQuery,
        setCategoryFilter,
        getFontById,
        getProjectById,
        addFont,
        addProject,
        addFontToProject,
        removeFontFromProject,
        deleteFont,
        deleteProject
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
