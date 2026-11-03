import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  BedDouble, 
  Utensils, 
  Sparkles, 
  Plus, 
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { subscribeToBusinesses } from '../../services/businesses';
import { subscribeToCollabInquiries } from '../../services/collab';
import { Business, CollabInquiry } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [collabs, setCollabs] = useState<CollabInquiry[]>([]);

  useEffect(() => {
    const unsubBiz = subscribeToBusinesses((data) => {
      setBusinesses(data);
    });

    const unsubCollab = subscribeToCollabInquiries((data) => {
      setCollabs(data);
    });

    return () => {
      unsubBiz();
      unsubCollab();
    };
  }, []);

  const totalRooms = businesses.reduce((acc, b) => acc + (b.totalRooms || 0), 0);
  const availableRooms = businesses.reduce((acc, b) => acc + (b.availableRooms || 0), 0);
  const totalFood = businesses.reduce((acc, b) => acc + (b.totalFoodItems || 0), 0);
  const activeCount = businesses.filter((b) => b.isActive).length;
  const pendingCollabs = collabs.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            HotelInfo Platform Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Platform Master Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time monitor for registered hotels, restaurants, rooms inventory, and partner onboarding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/businesses?action=new">
            <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Business
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Businesses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{businesses.length}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {activeCount} Active on Public Portal
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rooms Total</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalRooms}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {availableRooms} Currently Available
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Items</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalFood}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Active Dining Menus
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collab Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{collabs.length}</div>
            <div className="text-xs text-amber-600 font-bold mt-1">
              {pendingCollabs} Pending Review
            </div>
          </div>
        </div>
      </div>

      {/* Main Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Registered Businesses</h2>
            <Link to="/admin/businesses" className="text-xs text-amber-600 font-semibold hover:underline">
              View All ({businesses.length})
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No businesses registered in Firestore yet. Click "Add Business" above to register one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Business</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Rooms</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.slice(0, 5).map((biz) => (
                    <tr key={biz.businessId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{biz.businessName}</div>
                        <div className="text-[10px] text-slate-400">{biz.phone}</div>
                      </td>
                      <td className="py-3 px-3 capitalize">
                        {biz.businessType.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {biz.city}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-emerald-600">{biz.availableRooms ?? 0}</span> / {biz.totalRooms ?? 0}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={biz.isActive ? 'success' : 'neutral'} size="sm">
                          {biz.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link to={`/place/${biz.businessId}`} target="_blank" className="text-slate-400 hover:text-slate-700">
                          <ArrowUpRight className="w-4 h-4 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Partner Collab Requests</h2>
            <Link to="/admin/collabs" className="text-xs text-amber-600 font-semibold hover:underline">
              Manage All
            </Link>
          </div>

          {collabs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending partner requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {collabs.slice(0, 4).map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.businessName}</span>
                    <Badge variant={c.status === 'pending' ? 'warning' : 'success'} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="text-slate-500">{c.ownerName} • {c.city}</div>
                  <div className="text-slate-600 text-[11px] font-medium">{c.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
