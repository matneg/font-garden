
import React from 'react';
import { Font } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface FontTagsProps {
  font: Font;
}

const FontTags = ({ font }: FontTagsProps) => {
  const getTagsArray = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  if (!font.tags || font.tags.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="mr-2 h-5 w-5" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {getTagsArray(font.tags).map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-muted/50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FontTags;
