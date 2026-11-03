import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Store, User, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { subscribeToUsers, toggleUserActive, deleteUser } from '../../services/users';
import { MASTER_ADMIN_EMAIL } from '../../services/auth';
import { UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = subscribeToUsers((data) => {
      const hasMasterAdmin = data.some((u) => u.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());
      if (!hasMasterAdmin) {
        setUsers([
          {
            uid: 'master_admin_hotelinfo',
            name: 'Master Administrator',
            email: MASTER_ADMIN_EMAIL,
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          ...data
        ]);
      } else {
        setUsers(data);
      }
    });
    return () => unsub();
  }, []);

  const handleToggle = async (user: UserProfile) => {
    if (user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      toast.error('The Master Admin account cannot be deactivated.');
      return;
    }
    try {
      await toggleUserActive(user.uid, !user.isActive);
      toast.success(`User ${user.name} status updated.`);
    } catch (err: any) {
      toast.error('Error updating user: ' + err.message);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      toast.error('The Master Admin account cannot be removed.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove user "${user.name}"?`)) {
      try {
        await deleteUser(user.uid);
        toast.success(`User removed.`);
      } catch (err: any) {
        toast.error('Error deleting user: ' + err.message);
      }
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative, operator, and traveler identities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="business_admin">Business Admins</option>
            <option value="user">Travelers / Users</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs w-full focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        u.role === 'admin'
                          ? 'brand'
                          : u.role === 'business_admin'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded text-amber-700 bg-amber-50 border border-amber-200">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" />
                        <span>Master Active</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggle(u)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          u.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        {u.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        Master
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Remove User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
