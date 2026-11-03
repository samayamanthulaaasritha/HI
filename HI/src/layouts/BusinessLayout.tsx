import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  BedDouble, 
  UtensilsCrossed, 
  Clock, 
  Image as ImageIcon, 
  MapPin, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getBusinessById, subscribeToBusiness } from '../services/businesses';
import { Business } from '../types';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const BusinessLayout: React.FC = () => {
  const { userProfile, businessId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const unsub = subscribeToBusiness(businessId, (data) => {
      setBusiness(data);
    });
    return () => unsub();
  }, [businessId]);

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out of business portal.');
    navigate('/business/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/business/dashboard', icon: LayoutDashboard },
    { label: 'Business Profile', path: '/business/profile', icon: Store },
    { label: 'Rooms & Stays', path: '/business/rooms', icon: BedDouble },
    { label: 'Food & Dining', path: '/business/food', icon: UtensilsCrossed },
    { label: 'Live Availability', path: '/business/availability', icon: Clock },
    { label: 'Media Gallery', path: '/business/media', icon: ImageIcon },
    { label: 'Location & Map', path: '/business/location', icon: MapPin },
    { label: 'Settings', path: '/business/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-slate-300 border-r border-slate-800 z-20">
        {/* Business Header */}
        <div className="p-5 border-b border-slate-800 bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate">
                {business?.businessName || 'My Business Portal'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">
                  {business?.isActive ? 'Active on HotelInfo' : 'Draft / Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-navy-950 shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Preview Button */}
        {business && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/60">
            <Link
              to={`/place/${business.businessId}`}
              target="_blank"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Traveler View</span>
            </Link>
          </div>
        )}

        {/* User bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{userProfile?.name || 'Manager'}</div>
            <div className="text-[10px] text-slate-400 truncate">{userProfile?.email || 'manager@hotel.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Realistic & Premium Hotel Manager Lounge Background with Ken-Burns Motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <img
            src="/business-bg.jpg"
            alt="Business Operations Executive Lounge"
            className="w-full h-full object-cover object-center animate-ken-burns filter brightness-[0.65] contrast-[1.08]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/90" />
          <div className="absolute inset-0 bg-slate-950/35" />
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/10 to-transparent animate-luxury-sweep pointer-events-none" />
        </div>

        {/* Top bar */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                {navItems.find((n) => n.path === location.pathname)?.label || 'Business Portal'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ID: <span className="font-mono text-amber-400">{business?.businessId || businessId || 'hotel-grand-stay'}</span>
              </p>
            </div>
          </div>


          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {business && (
              <Link
                to={`/place/${business.businessId}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/15 text-slate-200 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            )}
          </div>
        </header>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 flex">
            <div className="w-64 bg-navy-950 text-slate-300 flex flex-col h-full animate-fade-in">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm truncate">{business?.businessName || 'Business Portal'}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-semibold">
                  Logout
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
