
import React from 'react';
import { Font } from '@/types';
import { getFontStyle } from '@/lib/fontLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

interface FontHeaderProps {
  font: Font;
  onDelete: () => Promise<void>;
}

const FontHeader = ({ font, onDelete }: FontHeaderProps) => {
  const navigate = useNavigate();

  return (
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
          <h1 className="text-3xl font-bold" style={getFontStyle(font)}>{font.name}</h1>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete font</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{font.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default FontHeader;
