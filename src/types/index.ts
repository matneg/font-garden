export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';

export type ProjectType = 'personal' | 'reference';

export interface Font {
  id: string;
  name: string;
  fontFamily: string | null;
  category: FontCategory;
  notes: string;
  tags: string;
  isCustom: boolean;
  fontFilePath: string | null;
  fontFormat: string | null;
  createdAt: string;
  updatedAt: string;
  projectCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type?: ProjectType;
  createdAt: string;
  updatedAt: string;
  fontCount: number;
}
