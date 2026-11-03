import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Building2, BedDouble, Utensils } from 'lucide-react';
import { subscribeToBusinesses } from '../../services/businesses';
import { subscribeToCollabInquiries } from '../../services/collab';
import { Business, CollabInquiry } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [collabs, setCollabs] = useState<CollabInquiry[]>([]);

  useEffect(() => {
    const unsubB = subscribeToBusinesses((data) => setBusinesses(data));
    const unsubC = subscribeToCollabInquiries((data) => setCollabs(data));
    return () => {
      unsubB();
      unsubC();
    };
  }, []);

  const totalRooms = businesses.reduce((acc, b) => acc + (b.totalRooms || 0), 0);
  const availableRooms = businesses.reduce((acc, b) => acc + (b.availableRooms || 0), 0);
  const totalFood = businesses.reduce((acc, b) => acc + (b.totalFoodItems || 0), 0);

  // Group by city from real Firestore businesses
  const cityCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    if (b.city) {
      cityCounts[b.city] = (cityCounts[b.city] || 0) + 1;
    }
  });

  const cityList = Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count,
    share: businesses.length > 0 ? `${Math.round((count / businesses.length) * 100)}%` : '0%'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Platform Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics calculated from active Firestore records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Properties</span>
          <div className="text-3xl font-black text-slate-900">{businesses.length}</div>
          <div className="text-xs text-slate-500">Live on network</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rooms Total</span>
          <div className="text-3xl font-black text-slate-900">{totalRooms}</div>
          <div className="text-xs text-emerald-600 font-semibold">{availableRooms} available</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Food Items</span>
          <div className="text-3xl font-black text-slate-900">{totalFood}</div>
          <div className="text-xs text-slate-500">{collabs.length} collab requests</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" /> City Distribution
        </h3>

        {cityList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No businesses registered yet.
          </div>
        ) : (
          <div className="space-y-3">
            {cityList.map((item) => (
              <div key={item.city} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.city}</span>
                  <span className="text-slate-500">{item.count} properties ({item.share})</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
