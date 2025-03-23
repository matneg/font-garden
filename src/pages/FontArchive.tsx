
import React from 'react';
import { useFontContext } from '@/context/FontContext';
import FontCard from '@/components/ui/FontCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { FontCategory } from '@/types';

const FontArchive = () => {
  const { 
    fonts, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    categoryFilter,
    setCategoryFilter
  } = useFontContext();
  
  const filteredFonts = fonts.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || font.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            Font Archive
          </h1>
          <p className="text-muted-foreground">
            Your collection of {fonts.length} fonts
          </p>
        </div>
        <Button asChild>
          <Link to="/fonts/add">
            <PlusCircle className="mr-2 h-5 w-5" /> 
            Add Font
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fonts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as FontCategory | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Font category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="sans-serif">Sans-serif</SelectItem>
              <SelectItem value="display">Display</SelectItem>
              <SelectItem value="handwriting">Handwriting</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-muted h-64"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredFonts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFonts.map((font) => (
                <FontCard key={font.id} font={font} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No fonts match your search criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}>
                Clear filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FontArchive;
