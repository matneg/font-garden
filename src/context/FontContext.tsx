
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Font, Project, FontCategory } from '@/types';

// Sample data until we connect to Supabase
const mockFonts: Font[] = [
  {
    id: '1',
    name: 'Inter',
    fontFamily: 'Inter',
    category: 'sans-serif',
    notes: 'Clean and modern sans-serif designed for screen use',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 3
  },
  {
    id: '2',
    name: 'Playfair Display',
    fontFamily: 'Playfair Display',
    category: 'serif',
    notes: 'Elegant serif with high contrast',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 1
  },
  {
    id: '3',
    name: 'Fira Code',
    fontFamily: 'Fira Code',
    category: 'monospace',
    notes: 'Monospace font with programming ligatures',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 0
  },
  {
    id: '4',
    name: 'Roboto',
    fontFamily: 'Roboto',
    category: 'sans-serif',
    notes: 'Google\'s Android system font',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 2
  },
  {
    id: '5',
    name: 'Dancing Script',
    fontFamily: 'Dancing Script',
    category: 'handwriting',
    notes: 'Casual handwriting script',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 1
  },
  {
    id: '6',
    name: 'Custom Brand Font',
    fontFamily: null,
    category: 'display',
    notes: 'Custom font for branding projects',
    isCustom: true,
    fontFilePath: '/fonts/custom-brand-font.woff',
    fontFormat: 'woff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectCount: 0
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Personal Portfolio',
    description: 'My design portfolio website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fontCount: 2
  },
  {
    id: '2',
    name: 'Client Branding Project',
    description: 'Brand identity for tech startup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fontCount: 3
  },
  {
    id: '3',
    name: 'Blog Redesign',
    description: 'Typography system for personal blog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fontCount: 2
  }
];

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
  addFont: (font: Font) => void; // Add this new function
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fonts, setFonts] = useState<Font[]>(mockFonts);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<FontCategory | 'all'>('all');

  // In a real app, this would fetch data from Supabase
  useEffect(() => {
    // Simulate API fetch with a delay
    setLoading(true);
    setTimeout(() => {
      setFonts(mockFonts);
      setProjects(mockProjects);
      setLoading(false);
    }, 500);
  }, []);

  const getFontById = (id: string): Font | undefined => {
    return fonts.find(font => font.id === id);
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  // Add a new function to add fonts
  const addFont = (font: Font): void => {
    setFonts(prevFonts => [...prevFonts, font]);
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
        addFont
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
