import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Utensils, 
  BedDouble, 
  PhoneCall, 
  ShieldAlert, 
  Store, 
  Menu, 
  X, 
  Sparkles,
  Compass,
  Search as SearchIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CollabModal } from '../components/common/CollabModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const UserLayout: React.FC = () => {
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { userProfile, isAdmin, isBusinessAdmin } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Main Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
        isDark ? 'bg-slate-950/90 border-white/10 shadow-lg text-white' : 'bg-white/95 border-slate-200 shadow-sm text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-navy-950 font-black text-lg shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
              HI
            </div>
            <div>
              <span className={`font-extrabold text-lg tracking-tight block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hotel<span className="text-amber-500">Info</span>
              </span>
              <span className={`text-[10px] block tracking-wider font-semibold uppercase -mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Stays & Dining
              </span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* The requested small button to send a message to collab their business to admin */}
            <button
              onClick={() => setIsCollabOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm active:scale-95 ${
                isDark 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25' 
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Partner with us: Submit your hotel or restaurant to the platform admin"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Collab Business</span>
            </button>

            {/* Direct Contact Page Button */}
            <Link to="/contact">
              <Button size="sm" variant="ghost" className={`font-semibold ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}>
                Contact
              </Button>
            </Link>

            {/* Portal link / status: Business Dashboard opens login page */}
            <Link to={isBusinessAdmin ? "/business/dashboard" : "/business/login"}>
              <Button size="sm" variant="amber" icon={<Store className="w-3.5 h-3.5 text-navy-950" />} className="font-bold text-navy-950">
                Business Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button size="sm" variant="ghost" icon={<ShieldAlert className="w-3.5 h-3.5 text-slate-400" />} className={`font-semibold ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-slate-900'}`}>
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsCollabOpen(true)}
              className="p-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Collab</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`sm:hidden border-t px-4 py-4 space-y-3 animate-fade-in shadow-lg ${
            isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-semibold">Appearance</span>
              <ThemeToggle showLabel={true} />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCollabOpen(true);
                }}
                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border ${
                  isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Collab Business</span>
              </button>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="ghost" className={`w-full justify-start font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`} icon={<PhoneCall className="w-4 h-4 text-amber-500" />}>
                  Contact Support
                </Button>
              </Link>
              <Link to={isBusinessAdmin ? "/business/dashboard" : "/business/login"} onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="primary" className="w-full justify-start" icon={<Store className="w-4 h-4 text-amber-400" />}>
                  Business Dashboard
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="ghost" className="w-full justify-start" icon={<ShieldAlert className="w-4 h-4" />}>
                    Platform Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 text-sm mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-navy-950 font-bold flex items-center justify-center text-sm">
                  HI
                </div>
                <span className="text-white font-bold text-base">HotelInfo</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering travelers in unfamiliar cities to instantly locate nearby hotels, verify real-time room types & availability, and discover authentic local food.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Popular Hubs</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/search?city=Hyderabad" className="hover:text-amber-400">Hyderabad (HITEC City & Secunderabad)</Link></li>
                <li><Link to="/search?city=Visakhapatnam" className="hover:text-amber-400">Visakhapatnam (Beach Road & Gajuwaka)</Link></li>
                <li><Link to="/search?city=Vijayawada" className="hover:text-amber-400">Vijayawada (Benz Circle & MG Road)</Link></li>
                <li><Link to="/search?city=Rajahmundry" className="hover:text-amber-400">Rajahmundry (Godavari Ghat)</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/search?filter=rooms" className="hover:text-amber-400">Find Available Rooms</Link></li>
                <li><Link to="/search?filter=food" className="hover:text-amber-400">Find Food & Restaurants</Link></li>
                <li><Link to="/contact" className="hover:text-amber-400">Contact & Support</Link></li>
                <li>
                  <button onClick={() => setIsCollabOpen(true)} className="text-amber-400 hover:text-amber-300">
                    Partner / Collab with Us
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Management</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/business/login" className="hover:text-amber-400">Business Dashboard</Link></li>
                {isAdmin && (
                  <li><Link to="/admin" className="hover:text-amber-400">Platform Admin</Link></li>
                )}
                <li className="text-[11px] text-slate-400 pt-2">
                  Emergency Support: +91 800-444-INFO
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
            <div>© {new Date().getFullYear()} HotelInfo (HI). All rights reserved. Real-time availability verified.</div>
            <div className="flex gap-4">
              <Link to="/contact" className="hover:text-white">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white">Security</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Collaboration Dialog */}
      <CollabModal isOpen={isCollabOpen} onClose={() => setIsCollabOpen(false)} />
    </div>
  );
};
