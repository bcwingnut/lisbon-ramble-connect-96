import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to Lisbon chat as the default location
  return <Navigate to="/chat/lisbon" replace />;
};

export default Index;
