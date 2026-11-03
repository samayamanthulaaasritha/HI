import React, { useState, useEffect } from 'react';
import { Store, Upload, Save, CheckCircle2, Lock, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeToBusiness, updateBusiness } from '../../services/businesses';
import { uploadImage } from '../../services/cloudinary';
import { Business } from '../../types';

export const BusinessProfilePage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState<Partial<Business>>({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    timings: '',
    coverImage: ''
  });

  useEffect(() => {
    const unsub = subscribeToBusiness(effectiveBizId, (data) => {
      if (data) {
        setBusiness(data);
        setForm(data);
      }
    });
    return () => unsub();
  }, [effectiveBizId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBusiness(effectiveBizId, form);
      toast.success('Business profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, coverImage: res.secure_url }));
      toast.success('Cover photo uploaded to Cloudinary!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Edit Business Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Keep your hotel or restaurant details up to date for arriving travelers
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        {/* Business ID Readonly Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Unique Property ID (Fixed by Admin):</span>
            <span className="font-mono font-bold text-slate-800">{effectiveBizId}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Protected identifier</span>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Property / Business Name"
            value={form.businessName || ''}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            required
          />
          <Input
            label="Reception / Contact Phone"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Inquiry Email"
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Business Timings"
            placeholder="e.g. 24 Hours Check-in | Resto 07:00 AM - 11:00 PM"
            value={form.timings || ''}
            onChange={(e) => setForm({ ...form, timings: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            About Your Property
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            rows={4}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Location Info */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" /> Address & City Details
          </h3>

          <Input
            label="Street Address / Landmark"
            value={form.address || ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              value={form.city || ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={form.state || ''}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <Input
              label="Country"
              value={form.country || 'India'}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
        </div>

        {/* Media / Cover photo */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Property Cover Photo
          </label>

          <div className="flex items-center gap-3">
            <Input
              placeholder="https://images.unsplash..."
              value={form.coverImage || ''}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="flex-1"
            />
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCover}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {form.coverImage && (
            <div className="h-44 rounded-2xl overflow-hidden border border-slate-200">
              <img src={form.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
