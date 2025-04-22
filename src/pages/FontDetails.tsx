
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFontContext } from '@/context/FontContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { loadGoogleFont, loadCustomFont } from '@/lib/fontLoader';
import FontHeader from '@/components/font-details/FontHeader';
import FontPreview from '@/components/font-details/FontPreview';
import FontTags from '@/components/font-details/FontTags';
import FontMetadata from '@/components/font-details/FontMetadata';
import RelatedProjects from '@/components/font-details/RelatedProjects';
import FontPairingSuggestions from '@/components/fonts/FontPairingSuggestions';

const FontDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const { getFontById, projects, deleteFont } = useFontContext();
  const navigate = useNavigate();
  
  const font = getFontById(id || '');
  
  useEffect(() => {
    if (font) {
      if (font.isCustom) {
        loadCustomFont(font);
      } else if (font.fontFamily) {
        loadGoogleFont(font.fontFamily);
      }
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

  const handleDeleteFont = async () => {
    if (id) {
      await deleteFont(id);
      navigate('/fonts', { replace: true });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <FontHeader font={font} onDelete={handleDeleteFont} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <FontPreview font={font} />
          <FontTags font={font} />
          
          {font.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Notes</h3>
              </div>
              <div className="card-content">
                <p className="text-muted-foreground">{font.notes}</p>
              </div>
            </div>
          )}
          
          <FontPairingSuggestions font={font} />
        </div>
        
        <div className="space-y-8">
          <FontMetadata font={font} />
          <RelatedProjects projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default FontDetails;
