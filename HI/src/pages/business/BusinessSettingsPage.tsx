import React from 'react';
import { Settings, ShieldCheck, KeyRound, Bell, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const BusinessSettingsPage: React.FC = () => {
  const { userProfile, businessId, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out of business portal.');
    navigate('/business/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Portal Security & Account Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Credentials, permissions, and operator session management
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Account Identity & Scope
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Logged In User</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{userProfile?.name || 'Manager'}</span>
              <span className="text-slate-500">{userProfile?.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Bound Business Scope</span>
              <span className="font-mono text-slate-900 font-bold text-sm block mt-0.5">{businessId || 'N/A'}</span>
              <span className="text-emerald-600 font-semibold text-[11px]">Strict Authorization Guard Active</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Availability Notification Alerts
          </h3>
          <p className="text-xs text-slate-500">
            Receive automated traveler inquiries when rooms are nearly fully booked.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input type="checkbox" defaultChecked className="rounded text-amber-500 w-4 h-4" />
            <span>Email notifications on urgent availability inquiries</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500">End your current front-desk session</span>
          <Button variant="danger" size="sm" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
            Sign Out of Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
