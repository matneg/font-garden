
import React from 'react';
import { Font } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getFontStyle } from '@/lib/fontLoader';

interface FontMetadataProps {
  font: Font;
}

const FontMetadata = ({ font }: FontMetadataProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Font Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Font Name</p>
          <p className="font-medium" style={getFontStyle(font)}>{font.name}</p>
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
  );
};

export default FontMetadata;
