import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If patient tries to access doctor page, redirect to patient dashboard
    if (user.role === 'patient') {
      return <Navigate to="/patient" replace />;
    }
    // If doctor tries to access patient page, redirect to doctor dashboard
    if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
