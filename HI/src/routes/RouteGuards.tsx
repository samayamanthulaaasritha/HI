import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  const isMasterAdmin =
    isAdmin && userProfile?.email?.toLowerCase().trim() === 'hotelinfoadmin@gmail.com';

  if (!userProfile || !isMasterAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export const BusinessRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading, isBusinessAdmin, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  if (!userProfile || (!isBusinessAdmin && !isAdmin)) {
    return <Navigate to="/business/login" replace />;
  }

  return <>{children}</>;
};
