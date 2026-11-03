import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  KeyRound, 
  Users, 
  Sparkles, 
  BarChart3, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const AdminLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out of Admin portal.');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Businesses', path: '/admin/businesses', icon: Building2 },
    { label: 'Business Credentials', path: '/admin/credentials', icon: KeyRound },
    { label: 'Platform Users', path: '/admin/users', icon: Users },
    { label: 'Collab Requests', path: '/admin/collabs', icon: Sparkles },
    { label: 'Search Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-slate-300 border-r border-slate-800 z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-navy-900">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-navy-950 font-extrabold flex items-center justify-center text-sm shadow-sm">
            HI
          </div>
          <div>
            <div className="font-bold text-white text-sm">HotelInfo Admin</div>
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Master Control
            </div>
          </div>
        </div>

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

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{userProfile?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-400 truncate">{userProfile?.email}</div>
            </div>
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

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Realistic & Premium Corporate Command HQ Background with Ken-Burns Motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <img
            src="/admin-bg.jpg"
            alt="Platform Operations Command HQ"
            className="w-full h-full object-cover object-center animate-ken-burns filter brightness-[0.65] contrast-[1.08]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/90" />
          <div className="absolute inset-0 bg-slate-950/35" />
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/10 to-transparent animate-luxury-sweep pointer-events-none" />
        </div>

        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(!mobileSidebar)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white capitalize">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Admin Management'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>View Live App</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </header>

        {mobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 flex">
            <div className="w-64 bg-navy-950 text-slate-300 flex flex-col h-full animate-fade-in">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm">HotelInfo Admin</span>
                <button onClick={() => setMobileSidebar(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebar(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-800">
                <Button size="sm" variant="danger" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebar(false)} />
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>

  );
};
