import React, { useState, useEffect } from 'react';
import { Clock, BedDouble, Utensils, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeToRooms, updateRoomAvailability } from '../../services/rooms';
import { subscribeToFoodItems, toggleFoodAvailability } from '../../services/food';
import { Room, FoodItem, RoomAvailabilityStatus } from '../../types';

export const BusinessAvailabilityPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const unsubR = subscribeToRooms(effectiveBizId, (data) => setRooms(data));
    const unsubF = subscribeToFoodItems(effectiveBizId, (data) => setFoodItems(data));
    return () => {
      unsubR();
      unsubF();
    };
  }, [effectiveBizId]);

  const handleRoomStatus = async (room: Room, status: RoomAvailabilityStatus) => {
    const count = status === 'Fully Booked' || status === 'Unavailable' ? 0 : Math.max(1, room.availableRooms);
    await updateRoomAvailability(room.roomId, status, count);
    toast.success(`${room.roomName} status changed to ${status}. Broadcasted to travelers!`);
  };

  const handleCountChange = async (room: Room, delta: number) => {
    const nextCount = Math.max(0, Math.min(room.totalRooms, room.availableRooms + delta));
    const nextStatus = nextCount === 0 ? 'Fully Booked' : nextCount <= 2 ? 'Limited' : 'Available';
    await updateRoomAvailability(room.roomId, nextStatus, nextCount);
  };

  const handleFoodToggle = async (item: FoodItem) => {
    await toggleFoodAvailability(item.foodId, !item.isAvailable);
    toast.success(`${item.name} availability toggled!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Front Desk Live Availability Console</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast-action console for front-desk receptionists to toggle live vacancies in real-time
        </p>
      </div>

      {/* Rooms Vacancy Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-purple-600" /> Room Vacancy Quick Adjustment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div key={room.roomId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{room.roomName}</h4>
                  <div className="text-xs text-slate-500">{room.roomType} • Total: {room.totalRooms} rooms</div>
                </div>

                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => handleCountChange(room, -1)}
                    className="w-6 h-6 rounded bg-slate-100 font-bold hover:bg-slate-200 text-slate-700"
                    title="Decrease available rooms"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold text-navy-950 w-6 text-center">
                    {room.availableRooms}
                  </span>
                  <button
                    onClick={() => handleCountChange(room, 1)}
                    className="w-6 h-6 rounded bg-slate-100 font-bold hover:bg-slate-200 text-slate-700"
                    title="Increase available rooms"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleRoomStatus(room, 'Available')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                    room.availabilityStatus === 'Available'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  🟢 Available
                </button>
                <button
                  onClick={() => handleRoomStatus(room, 'Limited')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                    room.availabilityStatus === 'Limited'
                      ? 'bg-amber-500 text-navy-950 border-amber-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  🟡 Limited
                </button>
                <button
                  onClick={() => handleRoomStatus(room, 'Fully Booked')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                    room.availabilityStatus === 'Fully Booked'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  🔴 Sold Out
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen Live Availability */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-500" /> Kitchen Menu Live Switch
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {foodItems.map((food) => (
            <div
              key={food.foodId}
              onClick={() => handleFoodToggle(food)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                food.isAvailable
                  ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 text-xs">{food.name}</div>
                <div className="text-[10px] text-slate-500">{food.category} • ₹{food.price}</div>
              </div>

              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                food.isAvailable ? 'text-emerald-800 bg-emerald-200/60' : 'text-slate-500 bg-slate-200'
              }`}>
                {food.isAvailable ? 'Serving' : 'Sold Out'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
