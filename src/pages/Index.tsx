import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Get the last visited chat location from localStorage, default to Lisbon
  const getLastChatLocation = () => {
    const lastLocation = localStorage.getItem('lastChatLocation');
    console.log('Getting last chat location:', lastLocation);
    return lastLocation || '/chat/lisbon';
  };

  const redirectTo = getLastChatLocation();
  console.log('Index redirecting to:', redirectTo);
  return <Navigate to={redirectTo} replace />;
};

export default Index;
