
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CreateProjectModal from '@/components/modals/CreateProjectModal';

// This is a utility page that automatically opens the create project modal
// and redirects back to projects when closed
const AddProject = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  
  // When modal closes, redirect to projects page
  useEffect(() => {
    if (!modalOpen) {
      navigate('/projects');
    }
  }, [modalOpen, navigate]);
  
  return <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />;
};

export default AddProject;
