import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  BedDouble, 
  Utensils, 
  Clock, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  TrendingUp, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { subscribeToBusiness } from '../../services/businesses';
import { subscribeToRooms } from '../../services/rooms';
import { subscribeToFoodItems } from '../../services/food';
import { Business, Room, FoodItem } from '../../types';

export const BusinessDashboardPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';

  const [business, setBusiness] = useState<Business | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubB = subscribeToBusiness(effectiveBizId, (data) => {
      setBusiness(data);
      setLoading(false);
    });

    const unsubR = subscribeToRooms(effectiveBizId, (data) => {
      setRooms(data);
    });

    const unsubF = subscribeToFoodItems(effectiveBizId, (data) => {
      setFoodItems(data);
    });

    return () => {
      unsubB();
      unsubR();
      unsubF();
    };
  }, [effectiveBizId]);

  const totalRooms = rooms.reduce((acc, r) => acc + (r.totalRooms || 0), 0);
  const availableRooms = rooms.reduce((acc, r) => acc + (r.availableRooms || 0), 0);
  const unavailableRooms = Math.max(0, totalRooms - availableRooms);
  const availableFood = foodItems.filter((f) => f.isAvailable).length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Property Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Welcome, {business?.businessName || 'Business Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{business?.address || 'Property Location'}, {business?.city}</span>
          </p>
        </div>

        {/* Prominent Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/business/rooms?action=new">
            <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Room
            </Button>
          </Link>
          <Link to="/business/food?action=new">
            <Button size="sm" variant="amber" icon={<Plus className="w-4 h-4" />}>
              Add Food
            </Button>
          </Link>
          <Link to={`/place/${effectiveBizId}`} target="_blank">
            <Button size="sm" variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
              Preview Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Rooms</span>
            <BedDouble className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{totalRooms}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Across all room types</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Available Rooms</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-3">{availableRooms}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Live for travelers to book</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Booked / Reserved</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-3">{unavailableRooms}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Occupied or unavailable</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Food Items</span>
            <Utensils className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{foodItems.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">{availableFood} currently available</div>
        </div>
      </div>

      {/* Primary Management Hub Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rooms Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-purple-600" /> Room Inventory & Live Availability
            </h3>
            <Link to="/business/rooms" className="text-xs font-semibold text-amber-600 hover:underline">
              Manage Rooms
            </Link>
          </div>

          <div className="space-y-3">
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No rooms registered yet. Click 'Add Room'.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.roomId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{room.roomName}</div>
                    <div className="text-xs text-slate-500">{room.roomType} • ₹{room.pricePerNight} / night</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      room.availabilityStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : room.availabilityStatus === 'Limited'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {room.availabilityStatus || 'Available'} ({room.availableRooms} left)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Food Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600" /> Kitchen Menu Status
            </h3>
            <Link to="/business/food" className="text-xs font-semibold text-amber-600 hover:underline">
              Manage Food
            </Link>
          </div>

          <div className="space-y-3">
            {foodItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No food items added yet. Click 'Add Food'.</p>
            ) : (
              foodItems.map((item) => (
                <div key={item.foodId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.category} • ₹{item.price}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.isAvailable ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                    }`}>
                      {item.isAvailable ? '● Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
