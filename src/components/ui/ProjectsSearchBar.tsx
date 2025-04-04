
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
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter: {projectTypeFilter === 'all' ? 'All' : projectTypeFilter}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup 
              value={projectTypeFilter} 
              onValueChange={(value) => setProjectTypeFilter(value as ProjectType | 'all')}
            >
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="reference">References</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {projectSortOrder === 'newest' && <ArrowDown className="h-4 w-4" />}
              {projectSortOrder === 'oldest' && <ArrowUp className="h-4 w-4" />}
              {projectSortOrder === 'name-asc' && <ArrowUp className="h-4 w-4" />}
              {projectSortOrder === 'name-desc' && <ArrowDown className="h-4 w-4" />}
              <span>{getSortLabel(projectSortOrder)}</span>
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

// Helper function to get the sort label
function getSortLabel(sortOrder: string): string {
  switch (sortOrder) {
    case 'newest':
      return 'Newest';
    case 'oldest':
      return 'Oldest';
    case 'name-asc':
      return 'A-Z';
    case 'name-desc':
      return 'Z-A';
    default:
      return 'Sort';
  }
}

export default ProjectsSearchBar;
