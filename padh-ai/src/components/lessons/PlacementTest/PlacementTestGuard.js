import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PlacementTestGuard = ({ children }) => {
  const { user, loading, placementTestStatus } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is logged in but placement test is not completed, redirect to placement test
  if (user && (!placementTestStatus || !placementTestStatus.placementTestCompleted)) {
    return <Navigate to="/placement-test" replace />;
  }

  return children;
};

export default PlacementTestGuard;
