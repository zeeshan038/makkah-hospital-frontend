import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }
  if (role !== 'pharmacy') {
    // User is not pharmacy, restrict access
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute; 