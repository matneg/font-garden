
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CreateProjectModal from '@/components/modals/CreateProjectModal';

// This is a utility page that automatically opens the create project modal
// and redirects back to projects when closed
const AddProject = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect back to projects page
    // The CreateProjectModal is set to auto-open, but we need to handle
    // the case when the user navigates directly to this URL
    navigate('/projects');
  }, [navigate]);
  
  return <CreateProjectModal />;
};

export default AddProject;
