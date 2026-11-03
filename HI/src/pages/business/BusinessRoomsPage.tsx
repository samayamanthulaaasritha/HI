import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BedDouble, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Upload, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  subscribeToRooms, 
  createRoom, 
  updateRoom, 
  updateRoomAvailability, 
  deleteRoom 
} from '../../services/rooms';
import { uploadImage } from '../../services/cloudinary';
import { Room, RoomAvailabilityStatus } from '../../types';

export const BusinessRoomsPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Room>>({
    roomName: '',
    roomType: 'Deluxe',
    description: '',
    pricePerNight: 2499,
    capacity: 2,
    totalRooms: 5,
    availableRooms: 3,
    amenities: ['AC', 'Free Wi-Fi', 'Attached Bath'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    availabilityStatus: 'Available'
  });

  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    const unsub = subscribeToRooms(effectiveBizId, (data) => {
      setRooms(data);
    });

    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }

    return () => unsub();
  }, [effectiveBizId, searchParams]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setForm({
      businessId: effectiveBizId,
      roomName: '',
      roomType: 'Deluxe',
      description: '',
      pricePerNight: 2499,
      capacity: 2,
      totalRooms: 5,
      availableRooms: 3,
      amenities: ['AC', 'Free Wi-Fi', 'Attached Bath'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      isAvailable: true,
      availabilityStatus: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setForm(room);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomName || !form.pricePerNight) {
      toast.error('Room name and price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.roomId, form);
        toast.success(`Room "${form.roomName}" updated.`);
      } else {
        await createRoom({
          businessId: effectiveBizId,
          roomName: form.roomName || 'Standard Room',
          roomType: form.roomType || 'Standard',
          description: form.description || '',
          pricePerNight: Number(form.pricePerNight) || 1500,
          capacity: Number(form.capacity) || 2,
          totalRooms: Number(form.totalRooms) || 1,
          availableRooms: Number(form.availableRooms) || 1,
          amenities: form.amenities || [],
          images: form.images || [],
          isAvailable: form.isAvailable ?? true,
          availabilityStatus: form.availabilityStatus || 'Available'
        });
        toast.success(`Room "${form.roomName}" created.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (room: Room, status: RoomAvailabilityStatus) => {
    const nextAvailCount = status === 'Fully Booked' || status === 'Unavailable' ? 0 : Math.max(1, room.availableRooms);
    try {
      await updateRoomAvailability(room.roomId, status, nextAvailCount);
      toast.success(`${room.roomName} marked as ${status}. Updated in real-time!`);
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (room: Room) => {
    if (window.confirm(`Delete room "${room.roomName}"?`)) {
      try {
        await deleteRoom(room.roomId);
        toast.success('Room deleted.');
      } catch (err: any) {
        toast.error('Failed to delete room: ' + err.message);
      }
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({
        ...prev,
        images: [res.secure_url, ...(prev.images || [])]
      }));
      toast.success('Room photo uploaded to Cloudinary!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Room Inventory & Availability</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage room types, capacities, amenities, and toggle instant live vacancy status
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Room Type
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          return (
            <div
              key={room.roomId}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="h-40 w-full relative bg-slate-100">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                    alt={room.roomName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-navy-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                    {room.roomType}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{room.roomName}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Capacity: {room.capacity} Guests • Total: {room.totalRooms}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">₹{room.pricePerNight}</div>
                      <div className="text-[10px] text-slate-400">/ night</div>
                    </div>
                  </div>

                  {/* Real-time Status Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Live Traveler Status (Realtime Synced):
                    </label>
                    <select
                      value={room.availabilityStatus || 'Available'}
                      onChange={(e) => handleQuickStatusChange(room, e.target.value as RoomAvailabilityStatus)}
                      className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                        room.availabilityStatus === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : room.availabilityStatus === 'Limited'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Available">🟢 Available ({room.availableRooms} Left)</option>
                      <option value="Limited">🟡 Limited Availability</option>
                      <option value="Fully Booked">🔴 Fully Booked</option>
                      <option value="Unavailable">⚫ Unavailable / Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {room.availableRooms} / {room.totalRooms} Vacant
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                    title="Edit Room"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Edit ${editingRoom.roomName}` : 'Add Room Category'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Room Category Name"
            placeholder="e.g. Deluxe Suite with Balcony"
            value={form.roomName || ''}
            onChange={(e) => setForm({ ...form, roomName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.roomType || 'Deluxe'}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              >
                <option value="Deluxe">Deluxe</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Twin">Twin</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
                <option value="AC">AC Room</option>
                <option value="Non-AC">Non-AC Room</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <Input
              label="Price Per Night (₹)"
              type="number"
              value={form.pricePerNight || ''}
              onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Max Guest Capacity"
              type="number"
              value={form.capacity || 2}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
            <Input
              label="Total Inventory"
              type="number"
              value={form.totalRooms || 5}
              onChange={(e) => setForm({ ...form, totalRooms: Number(e.target.value) })}
            />
            <Input
              label="Available Now"
              type="number"
              value={form.availableRooms || 3}
              onChange={(e) => setForm({ ...form, availableRooms: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Room Description & Highlights
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={2}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Cloudinary Room Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Room Image URL or Cloudinary Upload
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://..."
                value={form.images?.[0] || ''}
                onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                className="flex-1"
              />
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingRoom ? 'Save Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
