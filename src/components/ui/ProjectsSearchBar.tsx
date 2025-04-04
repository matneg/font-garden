
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Search, Filter, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ProjectType } from '@/types';
import { useFontContext } from '@/context/FontContext';

const ProjectsSearchBar: React.FC = () => {
  const { 
    projectSearchQuery, 
    setProjectSearchQuery, 
    projectTypeFilter, 
    setProjectTypeFilter,
    projectSortOrder,
    setProjectSortOrder
  } = useFontContext();

  const getSortButtonLabel = () => {
    switch (projectSortOrder) {
      case 'newest':
        return (
          <>
            <Calendar className="h-4 w-4 mr-1" />
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Newest</span>
          </>
        );
      case 'oldest':
        return (
          <>
            <Calendar className="h-4 w-4 mr-1" />
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Oldest</span>
          </>
        );
      case 'name-asc':
        return (
          <>
            <span className="mr-1">A</span>
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">A-Z</span>
          </>
        );
      case 'name-desc':
        return (
          <>
            <span className="mr-1">Z</span>
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Z-A</span>
          </>
        );
      default:
        return 'Sort';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
          value={projectSearchQuery}
          onChange={(e) => setProjectSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <ToggleGroup 
          type="single" 
          value={projectTypeFilter} 
          onValueChange={(value) => {
            if (value) setProjectTypeFilter(value as ProjectType | 'all');
          }}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="personal">Personal</ToggleGroupItem>
          <ToggleGroupItem value="reference">References</ToggleGroupItem>
        </ToggleGroup>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="flex items-center justify-center px-3">
              {getSortButtonLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup 
              value={projectSortOrder} 
              onValueChange={(value) => setProjectSortOrder(value as 'newest' | 'oldest' | 'name-asc' | 'name-desc')}
            >
              <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectsSearchBar;
