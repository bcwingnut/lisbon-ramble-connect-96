import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Get the last visited chat location from localStorage, default to Lisbon
  const getLastChatLocation = () => {
    const lastLocation = localStorage.getItem('lastChatLocation');
    return lastLocation || '/chat/lisbon';
  };

  return <Navigate to={getLastChatLocation()} replace />;
};

export default Index;
