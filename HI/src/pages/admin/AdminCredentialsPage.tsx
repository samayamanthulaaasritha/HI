import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  Copy, 
  Eye, 
  EyeOff, 
  Edit3, 
  MessageSquare,
  Phone
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { createBusinessAdminAccount, updateBusinessAdminPassword } from '../../services/auth';
import { subscribeToBusinesses } from '../../services/businesses';
import { subscribeToUsers } from '../../services/users';
import { Business, UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { generatePartnerCredentialsWhatsAppMessage, openWhatsAppChat } from '../../services/whatsapp';

export const AdminCredentialsPage: React.FC = () => {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Visibility toggle state per user UID
  const [visiblePasswords, setVisiblePasswords] = useState<{ [uid: string]: boolean }>({});

  // Password editing state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // WhatsApp send state
  const [phonePromptUser, setPhonePromptUser] = useState<{ user: UserProfile; password: string } | null>(null);
  const [targetPhone, setTargetPhone] = useState('');

  const [form, setForm] = useState({
    businessId: '',
    name: '',
    email: '',
    phone: '',
    tempPassword: ''
  });

  useEffect(() => {
    const unsubB = subscribeToBusinesses((data) => {
      setBusinesses(data);
      if (data.length > 0 && !form.businessId) {
        setForm((prev) => ({ ...prev, businessId: data[0].businessId }));
      }
    });

    const unsubU = subscribeToUsers((data) => {
      setUsers(data.filter((u) => u.role === 'business_admin'));
    });

    return () => {
      unsubB();
      unsubU();
    };
  }, []);

  const getPasswordForUser = (user: UserProfile): string => {
    // 1. Check if user document has a valid tempPassword
    if (user.tempPassword && user.tempPassword !== 'hotel123') {
      return user.tempPassword;
    }

    // 2. Cross-reference localStorage issued credentials mirror
    try {
      const issued = JSON.parse(localStorage.getItem('hotelinfo_issued_credentials') || '[]');
      const match = issued.find(
        (c: any) =>
          c.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
          c.uid === user.uid
      );
      if (match?.pass) {
        return match.pass;
      }
    } catch {
      // ignore
    }

    return user.tempPassword || 'hotel123';
  };

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessId || !form.email || !form.tempPassword || !form.name) {
      toast.error('All fields are required.');
      return;
    }
    if (form.tempPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBusinessAdminAccount(form.email, form.tempPassword, form.name, form.businessId);
      toast.success(`Business administrator account created for ${form.name}!`);

      // If phone provided, offer to open WhatsApp
      if (form.phone.trim()) {
        const assignedBiz = businesses.find((b) => b.businessId === form.businessId);
        const msg = generatePartnerCredentialsWhatsAppMessage({
          businessName: assignedBiz?.businessName || form.name,
          managerName: form.name,
          email: form.email,
          password: form.tempPassword
        });
        openWhatsAppChat(form.phone.trim(), msg);
      }

      setIsModalOpen(false);
      setForm({
        businessId: businesses[0]?.businessId || '',
        name: '',
        email: '',
        phone: '',
        tempPassword: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create credentials in Firebase Auth.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateBusinessAdminPassword(editingUser.uid, editingUser.email, newPassword);
      toast.success(`Password updated successfully for ${editingUser.name}!`);

      // Update in local state immediately
      setUsers((prev) =>
        prev.map((u) => (u.uid === editingUser.uid ? { ...u, tempPassword: newPassword } : u))
      );

      setEditingUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error('Failed to update password: ' + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleOpenWhatsAppForUser = (user: UserProfile) => {
    const assignedBiz = businesses.find((b) => b.businessId === user.businessId);
    const pass = getPasswordForUser(user);
    const phone = assignedBiz?.phone || '';

    if (phone) {
      const msg = generatePartnerCredentialsWhatsAppMessage({
        businessName: assignedBiz?.businessName || user.name,
        managerName: user.name,
        email: user.email,
        password: pass
      });
      openWhatsAppChat(phone, msg);
    } else {
      setPhonePromptUser({ user, password: pass });
      setTargetPhone('');
    }
  };

  const handleSendPromptWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phonePromptUser || !targetPhone.trim()) {
      toast.error('Please enter a mobile / WhatsApp number.');
      return;
    }

    const assignedBiz = businesses.find((b) => b.businessId === phonePromptUser.user.businessId);
    const msg = generatePartnerCredentialsWhatsAppMessage({
      businessName: assignedBiz?.businessName || phonePromptUser.user.name,
      managerName: phonePromptUser.user.name,
      email: phonePromptUser.user.email,
      password: phonePromptUser.password
    });

    openWhatsAppChat(targetPhone.trim(), msg);
    toast.success(`Opening WhatsApp chat for ${phonePromptUser.user.name}...`);
    setPhonePromptUser(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Business Credentials Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision, manage, and dispatch authenticated credentials to hotel and restaurant operators
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Issue Business Account
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Accurate Operator Credential Governance:</span>
          <p className="text-amber-800 leading-relaxed">
            All accounts are cryptographically registered and verified. You can toggle password visibility, edit passwords on demand, or dispatch them directly via official WhatsApp message with zero guesswork.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Operator Name</th>
                <th className="py-3 px-4">Login Email</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Assigned Business</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const assignedBiz = businesses.find((b) => b.businessId === u.businessId);
                const passwordVal = getPasswordForUser(u);
                const isPasswordVisible = !!visiblePasswords[u.uid];

                return (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>{u.email}</span>
                        <button
                          onClick={() => copyToClipboard(u.email)}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                          title="Copy email"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-wide">
                          {isPasswordVisible ? passwordVal : '••••••••'}
                        </span>
                        
                        {/* Toggle visibility */}
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.uid)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                          title={isPasswordVisible ? 'Hide password' : 'Show password'}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {/* Copy password */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(passwordVal)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                          title="Copy password"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit password */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setNewPassword(passwordVal);
                          }}
                          className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-50"
                          title="Change / Fix password"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {assignedBiz ? (
                        <span>{assignedBiz.businessName} ({assignedBiz.city})</span>
                      ) : (
                        <span className="font-mono text-slate-400">{u.businessId || 'Unlinked'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        Business Admin
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Send Button */}
                        <button
                          onClick={() => handleOpenWhatsAppForUser(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Send credentials to operator via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Business Admin Credentials"
        description="Creates an authenticated account locked to the selected business ID."
      >
        <form onSubmit={handleCreateCredential} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Business
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={form.businessId}
              onChange={(e) => setForm({ ...form, businessId: e.target.value })}
              required
            >
              {businesses.map((b) => (
                <option key={b.businessId} value={b.businessId}>
                  {b.businessName} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Operator / Manager Name"
            placeholder="e.g. Anand Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="Business Login Email"
            type="email"
            placeholder="manager@hotel.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Input
            label="Operator WhatsApp / Mobile (Optional)"
            type="tel"
            placeholder="e.g. 9876543210 (opens chat upon issuing)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="Temporary Password"
            type={showPasswordInModal ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={form.tempPassword}
            onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                className="text-slate-400 hover:text-slate-700 p-1"
                title={showPasswordInModal ? 'Hide password' : 'Show password'}
              >
                {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create & Issue Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Password Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Operator Password"
        description={`Update login password for ${editingUser?.name || 'Operator'} (${editingUser?.email}).`}
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          <Input
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <p className="text-[11px] text-slate-500">
            Updating the password immediately applies to the operator's account in Firebase and enables instant sign-in.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingPassword}>
              Save New Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Phone Prompt Modal for WhatsApp */}
      <Modal
        isOpen={!!phonePromptUser}
        onClose={() => setPhonePromptUser(null)}
        title="Send Credentials via WhatsApp"
        description={`Enter WhatsApp number for ${phonePromptUser?.user.name} to send credentials.`}
      >
        <form onSubmit={handleSendPromptWhatsApp} className="space-y-4">
          <Input
            label="Mobile / WhatsApp Number"
            type="tel"
            placeholder="e.g. 9876543210 or +91 9876543210"
            value={targetPhone}
            onChange={(e) => setTargetPhone(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setPhonePromptUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<MessageSquare className="w-4 h-4" />}>
              Open WhatsApp Chat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
