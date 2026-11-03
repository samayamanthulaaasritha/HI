import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  ExternalLink,
  MessageSquare,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { subscribeToCollabInquiries, updateCollabStatus } from '../../services/collab';
import { createBusinessAdminAccount } from '../../services/auth';
import { createBusiness, getBusinessById, subscribeToBusinesses } from '../../services/businesses';
import { generatePartnerCredentialsWhatsAppMessage, openWhatsAppChat } from '../../services/whatsapp';
import { CollabInquiry, Business } from '../../types';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminCollabPage: React.FC = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<CollabInquiry[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'approved'>('all');
  const [search, setSearch] = useState('');

  // Issue Credentials Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<CollabInquiry | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    businessId: '',
    password: ''
  });

  useEffect(() => {
    const unsubInq = subscribeToCollabInquiries((data) => {
      setInquiries(data);
    });
    const unsubBiz = subscribeToBusinesses((data) => {
      setBusinesses(data);
    });

    return () => {
      unsubInq();
      unsubBiz();
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: CollabInquiry['status']) => {
    await updateCollabStatus(id, status);
    toast.success(`Request marked as ${status}.`);
  };

  const handleOpenApproveModal = (item: CollabInquiry) => {
    setSelectedInquiry(item);

    // Auto-generate a clean property identifier
    const baseSlug = (item.businessName || 'biz')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 16);
    const generatedId = `${baseSlug}_${Date.now().toString().slice(-4)}`;

    // Auto-generate strong secure temporary password
    const suggestedPassword = `Hotel@${Math.floor(1000 + Math.random() * 9000)}`;

    setForm({
      businessName: item.businessName || '',
      ownerName: item.ownerName || '',
      email: item.email || '',
      phone: item.phone || '',
      city: item.city || '',
      businessId: generatedId,
      password: suggestedPassword
    });

    setIsModalOpen(true);
  };

  const handleIssueAndSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.ownerName || !form.email || !form.password) {
      toast.error('All credential fields are required.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Mark request as approved
      if (selectedInquiry) {
        await updateCollabStatus(selectedInquiry.id, 'approved');
      }

      // 2. Ensure business profile is created in businesses directory
      const existing = await getBusinessById(form.businessId);
      if (!existing) {
        await createBusiness({
          businessId: form.businessId,
          businessName: form.businessName,
          city: form.city || 'India',
          phone: form.phone,
          email: form.email,
          address: `${form.businessName}, ${form.city || ''}`,
          isActive: true
        });
      }

      // 3. Issue operator admin account
      await createBusinessAdminAccount(
        form.email,
        form.password,
        form.ownerName,
        form.businessId
      );

      toast.success(`Credentials issued for ${form.ownerName}!`);

      // 4. Generate professional WhatsApp credentials message
      const whatsappMsg = generatePartnerCredentialsWhatsAppMessage({
        businessName: form.businessName,
        managerName: form.ownerName,
        email: form.email,
        password: form.password
      });

      // 5. Open WhatsApp chat with prefilled message
      openWhatsAppChat(form.phone, whatsappMsg);
      toast.success(`WhatsApp chat opened with credentials for ${form.ownerName}!`);

      setIsModalOpen(false);
      setSelectedInquiry(null);
    } catch (err: any) {
      toast.error('Failed to issue credentials: ' + (err.message || 'Error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = inquiries.filter((inq) => {
    if (filter !== 'all' && inq.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inq.businessName?.toLowerCase().includes(q) ||
        inq.ownerName?.toLowerCase().includes(q) ||
        inq.city?.toLowerCase().includes(q) ||
        inq.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Partner Collaboration Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review onboarding requests, approve hoteliers, and issue credentials directly via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'contacted', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-navy-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-amber-500" />}
          title="No collaboration inquiries"
          description="Inquiries submitted by travelers or business owners via the 'Collab Business' button will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {item.businessName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.ownerName} • <span className="font-medium text-slate-700">{item.city}</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      item.status === 'pending'
                        ? 'warning'
                        : item.status === 'approved'
                        ? 'success'
                        : 'info'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 line-clamp-3">
                  "{item.message || 'Interested in partnering with HotelInfo.'}"
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${item.phone}`} className="font-mono text-slate-700 hover:underline">
                      {item.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${item.email}`} className="text-slate-700 hover:underline truncate">
                      {item.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'contacted')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  Mark Contacted
                </button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenApproveModal(item)}
                    icon={<KeyRound className="w-3.5 h-3.5 text-amber-400" />}
                    className="text-xs px-3 py-1 font-semibold"
                  >
                    {item.status === 'approved' ? 'Credentials / WhatsApp' : 'Approve & Issue'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Credentials Modal with Auto WhatsApp Dispatch */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Business Admin Credentials"
        description={`Approve request and issue dedicated credentials for ${form.businessName || 'Business'}.`}
      >
        <form onSubmit={handleIssueAndSendWhatsApp} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Submitting this form issues credentials and immediately opens WhatsApp with an official credentials message for the manager.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Property Name"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />

            <Input
              label="Operator / Manager Name"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Login Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <Input
              label="WhatsApp / Mobile Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City / Location"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />

            <Input
              label="Assigned Business ID"
              value={form.businessId}
              onChange={(e) => setForm({ ...form, businessId: e.target.value })}
              required
            />
          </div>

          <Input
            label="Temporary Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
              className="bg-navy-950 hover:bg-slate-900"
            >
              Issue & Send via WhatsApp
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
