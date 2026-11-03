import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Building2, Send, CheckCircle2 } from 'lucide-react';
import { submitCollabInquiry } from '../../services/collab';
import { useToast } from '../../context/ToastContext';
import { BusinessType } from '../../types';

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollabModal: React.FC<CollabModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    businessType: 'hotel_restaurant' as BusinessType,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.phone || !formData.email) {
      toast.error('Please fill in your business name, email, and phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCollabInquiry(formData);
      setIsSuccess(true);
      toast.success('Your partnership request has been sent to the HotelInfo Admin team.');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({
          businessName: '',
          ownerName: '',
          email: '',
          phone: '',
          city: '',
          businessType: 'hotel_restaurant',
          message: ''
        });
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Partner with HotelInfo (HI)"
      description="List your hotel or restaurant on HotelInfo and connect directly with thousands of travelers."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Request Submitted!</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Our onboarding team will review your business credentials and contact you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Business / Hotel Name"
              placeholder="e.g. Grand Vista Hotel"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
            <Input
              label="Owner / Manager Name"
              placeholder="e.g. Ramesh Kumar"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="contact@business.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone / Mobile"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="City / Location"
              placeholder="e.g. Hyderabad, Vizag"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                <option value="hotel_restaurant">Hotel & Restaurant (Both)</option>
                <option value="hotel">Hotel Only</option>
                <option value="restaurant">Restaurant Only</option>
                <option value="lodge">Lodge / Guest House</option>
                <option value="resort">Resort</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Message / Facility Details
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
              rows={3}
              placeholder="Tell us about your room capacity, food specials, or location landmark..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="amber"
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Send Collab Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
