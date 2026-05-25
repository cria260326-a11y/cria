import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    const paths = {
      admin: '/dashboard/admin',
      admin_visione: '/dashboard/admin',
      manager: '/dashboard/admin',
      avvocato: '/dashboard/avvocato',
      locatore: '/dashboard/landlord-p1',
      locatore_prodotto1: '/dashboard/landlord-p1',
      locatore_prodotto2: '/dashboard/landlord-p2',
      inquilino: '/dashboard/tenant',
      cliente: '/dashboard/cliente',
      commerciale: '/dashboard/commerciale'
    };
    return <Navigate to={paths[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
