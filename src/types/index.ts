
export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace' | 'other';

export type FontFormat = 'woff' | 'woff2' | 'truetype' | 'opentype' | 'svg' | 'embedded-opentype';

export type PreviewContext = 'custom' | 'heading' | 'subheading' | 'paragraph';

export interface FontPreviewOptions {
  text: string;
  context: PreviewContext;
}

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
  fontFormat: FontFormat | null;
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
