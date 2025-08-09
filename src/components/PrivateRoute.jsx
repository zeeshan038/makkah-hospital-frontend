import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'pharmacy') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute; 