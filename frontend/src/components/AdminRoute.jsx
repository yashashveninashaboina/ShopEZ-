import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (user && user.role === 'ADMIN') {
    return children;
  }

  // If not admin, redirect to home page
  return <Navigate to="/" replace />;
};

export default AdminRoute;
