import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  MapPin,
  Eye,
  Phone,
  Mail,
  Upload
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { subscribeToBusinesses, createBusiness, updateBusiness, toggleBusinessStatus } from '../../services/businesses';
import { uploadImage } from '../../services/cloudinary';
import { useToast } from '../../context/ToastContext';
import { Business, BusinessType } from '../../types';

export const AdminBusinessesPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Business>>({
    businessName: '',
    businessType: 'hotel_restaurant',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.44,
    longitude: 78.38,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    totalRooms: 10,
    availableRooms: 5,
    startingRoomPrice: 1999,
    startingFoodPrice: 150,
    isActive: true
  });

  useEffect(() => {
    const unsub = subscribeToBusinesses((data) => {
      setBusinesses(data);
      setLoading(false);
    });

    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }

    return () => unsub();
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingBiz(null);
    setFormData({
      businessName: '',
      businessType: 'hotel_restaurant',
      description: '',
      phone: '',
      email: '',
      address: '',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      latitude: 17.44,
      longitude: 78.38,
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      totalRooms: 10,
      availableRooms: 5,
      startingRoomPrice: 1999,
      startingFoodPrice: 150,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (biz: Business) => {
    setEditingBiz(biz);
    setFormData(biz);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.city) {
      toast.error('Business Name and City are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBiz) {
        await updateBusiness(editingBiz.businessId, formData);
        toast.success(`Updated ${formData.businessName} successfully.`);
      } else {
        await createBusiness(formData);
        toast.success(`Created ${formData.businessName} successfully.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (biz: Business) => {
    const nextStatus = !biz.isActive;
    try {
      await toggleBusinessStatus(biz.businessId, nextStatus);
      toast.success(`${biz.businessName} is now ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      toast.error('Could not update status: ' + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, coverImage: res.secure_url }));
      toast.success('Cover image uploaded to Cloudinary!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Filter list
  const filtered = businesses.filter((b) => {
    if (statusFilter === 'active' && !b.isActive) return false;
    if (statusFilter === 'inactive' && b.isActive) return false;
    if (typeFilter !== 'all' && b.businessType !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        b.businessName?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Businesses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer verified hotel and restaurant partners on the HotelInfo network
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Business
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, city, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="hotel_restaurant">Hotel & Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="lodge">Lodge</option>
            <option value="resort">Resort</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Rooms</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((biz) => (
                <tr key={biz.businessId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={biz.coverImage}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{biz.businessName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {biz.businessId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 capitalize font-medium">
                    {biz.businessType.replace('_', ' & ')}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {biz.city}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>{biz.phone || '—'}</div>
                    <div className="text-[10px] truncate max-w-[140px]">{biz.email || '—'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-600">{biz.availableRooms ?? 0}</span> / {biz.totalRooms ?? 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(biz)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                        biz.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {biz.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                      <span>{biz.isActive ? 'Active' : 'Deactivated'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/place/${biz.businessId}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="View Live Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(biz)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        title="Edit Business"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(biz)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        title={biz.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBiz ? `Edit ${editingBiz.businessName}` : 'Register New Business'}
        description="Enter property details to establish this business on the HotelInfo network."
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value as BusinessType })}
              >
                <option value="hotel_restaurant">Hotel & Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="lodge">Lodge</option>
                <option value="resort">Resort</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <Input
            label="Street Address / Landmark"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Cover image upload via Cloudinary */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Cover Image URL or Cloudinary Upload
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://..."
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="flex-1"
              />
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>
            </div>
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Preview"
                className="h-24 w-full rounded-xl object-cover border border-slate-200 mt-2"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingBiz ? 'Save Changes' : 'Create Business'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
