import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

import { Eye, EyeOff } from 'lucide-react';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD } from '../../services/auth';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    // Strictly enforce hotelinfoadmin@gmail.com and matching password
    if (cleanEmail !== MASTER_ADMIN_EMAIL.toLowerCase() || password !== MASTER_ADMIN_PASSWORD) {
      toast.error('Access Denied: Invalid credentials for Admin access.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanEmail, password);
      toast.success('Signed in to Master Admin Dashboard.');
      navigate('/admin');
    } catch (err: any) {
      toast.error('Authentication error: ' + (err.message || 'Check credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Controls Bar */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold mb-6 transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to HotelInfo Traveler Portal</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-navy-950 font-black text-xl flex items-center justify-center mx-auto shadow-lg">
            HI
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            HotelInfo Master Admin Portal
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Platform governance, business credential issuing & analytics
          </p>
        </div>

        <div className={`mt-8 border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              labelClassName={`font-bold text-xs uppercase tracking-wider mb-1.5 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
              type="email"
              placeholder="admin@hotelinfo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              className={`text-sm font-medium focus:border-amber-400 focus:ring-amber-400/20 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
              required
            />

            <Input
              label="Password"
              labelClassName={`font-bold text-xs uppercase tracking-wider mb-1.5 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`transition-colors focus:outline-none p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              className={`text-sm font-medium focus:border-amber-400 focus:ring-amber-400/20 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
              required
            />

            <Button
              type="submit"
              variant="amber"
              size="md"
              className="w-full font-bold text-navy-950 mt-2"
              isLoading={isLoading}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Sign In to Master Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
