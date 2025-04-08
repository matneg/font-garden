
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Font } from '@/types';

interface FontCardProps {
  font: Font;
}

const FontCard: React.FC<FontCardProps> = ({ font }) => {
  const getFontFamily = (): React.CSSProperties => {
    if (font.isCustom) {
      // For custom fonts, use a sanitized version of the font name as the font family
      const fontFamily = font.name.replace(/[^a-zA-Z0-9]/g, '');
      return { fontFamily: `"${fontFamily}", ${font.category}` };
    } else if (font.fontFamily) {
      // For Google fonts
      return { fontFamily: `"${font.fontFamily}", ${font.category}` };
    }
    return {};
  };

  return (
    <Link to={`/fonts/${font.id}`}>
      <Card className="h-full overflow-hidden card-hover">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-sans">
              {font.name}
            </CardTitle>
            <Badge variant={font.isCustom ? "outline" : "secondary"}>
              {font.isCustom ? 'Custom' : 'Google Font'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="h-24 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden mb-4"
          >
            <p className="text-2xl truncate w-full text-center px-2" style={getFontFamily()}>
              {font.name}
            </p>
          </div>
          <Badge variant="outline" className="mb-2">
            {font.category}
          </Badge>
          {font.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {font.notes}
            </p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-3">
          {font.projectCount === 0 
            ? 'Not used in any projects' 
            : `Used in ${font.projectCount} ${font.projectCount === 1 ? 'project' : 'projects'}`}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default FontCard;
