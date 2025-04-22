
import React, { useState } from 'react';
import { PreviewContext, FontPreviewOptions, Font } from '@/types';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFontStyle } from '@/lib/fontLoader';

interface FontPreviewProps {
  font: Font;
}

const FontPreview = ({ font }: FontPreviewProps) => {
  const [previewOptions, setPreviewOptions] = useState<FontPreviewOptions>({
    text: 'The quick brown fox jumps over the lazy dog',
    context: 'custom'
  });

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
              style={getFontStyle(font)}
            >
              <div className={getPreviewClassName()}>
                {previewOptions.text || 'Enter text to preview'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="samples">
            <div 
              className="space-y-8 p-6 bg-muted/30 rounded-lg"
              style={getFontStyle(font)}
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
  );
};

export default FontPreview;
