import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Utensils, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Upload 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  subscribeToFoodItems, 
  createFoodItem, 
  updateFoodItem, 
  toggleFoodAvailability, 
  deleteFoodItem 
} from '../../services/food';
import { uploadImage } from '../../services/cloudinary';
import { FoodItem } from '../../types';

export const BusinessFoodPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<FoodItem>>({
    name: '',
    category: 'Dinner',
    description: '',
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isVeg: true,
    preparationTime: '15 min'
  });

  useEffect(() => {
    const unsub = subscribeToFoodItems(effectiveBizId, (data) => {
      setFoodItems(data);
    });

    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }

    return () => unsub();
  }, [effectiveBizId, searchParams]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      businessId: effectiveBizId,
      name: '',
      category: 'Dinner',
      description: '',
      price: 220,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isVeg: true,
      preparationTime: '15 min'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setForm(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Dish name and price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateFoodItem(editingItem.foodId, form);
        toast.success(`Dish "${form.name}" updated.`);
      } else {
        await createFoodItem({
          businessId: effectiveBizId,
          name: form.name || 'Signature Dish',
          category: form.category || 'Lunch',
          description: form.description || '',
          price: Number(form.price) || 150,
          imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
          isAvailable: form.isAvailable ?? true,
          isVeg: form.isVeg ?? true,
          preparationTime: form.preparationTime || '15 min'
        });
        toast.success(`Dish "${form.name}" added to menu.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save food item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item: FoodItem) => {
    const next = !item.isAvailable;
    try {
      await toggleFoodAvailability(item.foodId, next);
      toast.success(`${item.name} is now ${next ? 'Available' : 'Unavailable'}. Synced in real-time!`);
    } catch (err: any) {
      toast.error('Could not toggle food: ' + err.message);
    }
  };

  const handleDelete = async (item: FoodItem) => {
    if (window.confirm(`Delete dish "${item.name}"?`)) {
      try {
        await deleteFoodItem(item.foodId);
        toast.success('Dish removed from menu.');
      } catch (err: any) {
        toast.error('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.secure_url }));
      toast.success('Food photo uploaded to Cloudinary!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Food Menu & Live Kitchen Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add signature dishes, configure vegetarian flags, and toggle immediate dish availability
          </p>
        </div>

        <Button
          variant="amber"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Food Item
        </Button>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map((item) => (
          <div
            key={item.foodId}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="h-40 w-full relative bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-navy-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {item.category}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`w-3.5 h-3.5 rounded-full border border-white inline-block shadow-sm ${
                    item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`} />
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  <div className="font-black text-slate-900 text-sm">₹{item.price}</div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" /> Prep Time: {item.preparationTime || '15 min'}
                </div>
              </div>
            </div>

            {/* Availability Toggle and Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => handleToggle(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  item.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                title="Toggle availability"
              >
                {item.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
              </button>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-white"
                  title="Edit Dish"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white"
                  title="Delete Dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${editingItem.name}` : 'Add Food Item to Menu'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Dish Name"
            placeholder="e.g. Special Hyderabadi Chicken Biryani"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form.category || 'Dinner'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
                <option value="South Indian">South Indian</option>
                <option value="North Indian">North Indian</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Price (₹)"
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Prep Time"
              placeholder="e.g. 15 min"
              value={form.preparationTime || ''}
              onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
            />
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVeg}
                  onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Pure Vegetarian</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Available Now</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Ingredients
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={2}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Cloudinary Food Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Food Image URL or Cloudinary Upload
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://..."
                value={form.imageUrl || ''}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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
            <Button type="submit" variant="amber" isLoading={isSubmitting}>
              {editingItem ? 'Save Dish' : 'Add Food Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
