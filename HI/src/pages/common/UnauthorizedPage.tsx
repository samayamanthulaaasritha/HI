import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-subtle border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          You don't have authorization to view this area. Business operators can only access their own property portal.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="sm" icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/business/login">
          <Button variant="outline" size="sm">
            Business Portal Login
          </Button>
        </Link>
      </div>
    </div>
  );
};
