
export type FontCategory = 
  | 'serif' 
  | 'sans-serif' 
  | 'display' 
  | 'handwriting' 
  | 'monospace' 
  | 'other';

export type FontFormat = 
  | 'woff' 
  | 'woff2' 
  | 'truetype' 
  | 'opentype' 
  | 'svg' 
  | 'embedded-opentype';

export interface Font {
  id: string;
  name: string;
  fontFamily: string | null;
  category: FontCategory;
  notes?: string;
  isCustom: boolean;
  fontFilePath?: string | null;
  fontFormat?: FontFormat | null;
  createdAt: string;
  updatedAt: string;
  projectCount?: number; // For garden visualization
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  fontCount?: number;
}

export interface FontProject {
  id: string;
  fontId: string;
  projectId: string;
  annotation?: string;
  createdAt: string;
}

export interface ExternalReference {
  id: string;
  fontId: string;
  projectName: string;
  url?: string;
  createdAt: string;
}

// For the font preview feature
export type PreviewContext = 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'custom';

export interface FontPreviewOptions {
  text: string;
  context: PreviewContext;
  fontSize?: number;
  fontWeight?: number | string;
}
