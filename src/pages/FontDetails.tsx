
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFontContext } from '@/context/FontContext';
import { PreviewContext, FontPreviewOptions } from '@/types';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Textarea 
} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Edit,
  Trash,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FontDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getFontById, projects } = useFontContext();
  const navigate = useNavigate();
  
  const font = getFontById(id || '');
  
  const [previewOptions, setPreviewOptions] = useState<FontPreviewOptions>({
    text: 'The quick brown fox jumps over the lazy dog',
    context: 'custom'
  });
  
  // Find related projects (in a real app, this would be a database query)
  const relatedProjects = projects.slice(0, 2);
  
  // Load Google Font dynamically for preview
  useEffect(() => {
    if (font && !font.isCustom && font.fontFamily) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.fontFamily.replace(' ', '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [font]);
  
  if (!font) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Font not found</h2>
        <p className="text-muted-foreground mb-6">The font you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/fonts">Back to Font Archive</Link>
        </Button>
      </div>
    );
  }
  
  const getFontPreviewStyle = () => {
    if (font.isCustom) {
      // In a real app, we would use uploaded font files
      return {};
    } else {
      return { fontFamily: font.fontFamily || 'sans-serif' };
    }
  };
  
  const getPreviewClassName = () => {
    switch (previewOptions.context) {
      case 'heading':
        return 'font-preview-heading';
      case 'subheading':
        return 'font-preview-subheading';
      case 'paragraph':
        return 'font-preview-body';
      default:
        return 'text-4xl';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{font.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>{font.category}</Badge>
              <Badge variant={font.isCustom ? "outline" : "secondary"}>
                {font.isCustom ? 'Custom Font' : 'Google Font'}
              </Badge>
              {font.projectCount !== undefined && font.projectCount > 0 && (
                <Badge variant="outline" className="bg-green-50">
                  Used in {font.projectCount} {font.projectCount === 1 ? 'project' : 'projects'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your font looks in different contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="custom">
                <TabsList className="mb-4">
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                  <TabsTrigger value="samples">Samples</TabsTrigger>
                </TabsList>
                <TabsContent value="custom" className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-2/3">
                      <Textarea
                        value={previewOptions.text}
                        onChange={(e) => setPreviewOptions({
                          ...previewOptions,
                          text: e.target.value
                        })}
                        placeholder="Enter text to preview..."
                        className="resize-none h-24"
                      />
                    </div>
                    <div className="w-full sm:w-1/3">
                      <Select
                        value={previewOptions.context}
                        onValueChange={(value) => setPreviewOptions({
                          ...previewOptions,
                          context: value as PreviewContext
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="heading">Heading</SelectItem>
                          <SelectItem value="subheading">Subheading</SelectItem>
                          <SelectItem value="paragraph">Paragraph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div 
                    className="mt-6 p-6 bg-muted/30 rounded-lg"
                    style={getFontPreviewStyle()}
                  >
                    <div className={getPreviewClassName()}>
                      {previewOptions.text || 'Enter text to preview'}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="samples">
                  <div 
                    className="space-y-8 p-6 bg-muted/30 rounded-lg"
                    style={getFontPreviewStyle()}
                  >
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Heading</p>
                      <h2 className="font-preview-heading">The quick brown fox jumps over the lazy dog</h2>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Subheading</p>
                      <h3 className="font-preview-subheading">The five boxing wizards jump quickly</h3>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Paragraph</p>
                      <p className="font-preview-body">
                        Typography is the art and technique of arranging type to make written language 
                        legible, readable, and appealing when displayed. The arrangement of type involves 
                        selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, 
                        and adjusting the space between pairs of letters.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {font.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{font.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Font Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Font Name</p>
                <p className="font-medium">{font.name}</p>
              </div>
              
              {font.fontFamily && (
                <div>
                  <p className="text-sm text-muted-foreground">Font Family</p>
                  <p className="font-medium">{font.fontFamily}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{font.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{font.isCustom ? 'Custom Font' : 'Google Font'}</p>
              </div>
              
              {font.isCustom && font.fontFormat && (
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{font.fontFormat}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Added On</p>
                <p className="font-medium">
                  {new Date(font.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <LinkIcon className="mr-2 h-5 w-5" />
                Related Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProjects.length > 0 ? (
                <ul className="space-y-3">
                  {relatedProjects.map(project => (
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
        </div>
      </div>
    </div>
  );
};

export default FontDetails;
