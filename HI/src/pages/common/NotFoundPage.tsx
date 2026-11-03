import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-subtle border border-amber-200">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-700">Looks like you've taken a wrong turn.</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          The page or destination you are searching for does not exist on the HotelInfo network.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="sm" icon={<Home className="w-4 h-4" />}>
            Go Home
          </Button>
        </Link>
        <Link to="/search">
          <Button variant="outline" size="sm" icon={<Search className="w-4 h-4" />}>
            Search Stays
          </Button>
        </Link>
      </div>
    </div>
  );
};
