import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, Shield, Hospital, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers(roleFilter);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      showError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    setTogglingId(user._id);
    try {
      const res = await api.admin.toggleUserStatus(user._id);
      if (res.success) {
        showSuccess(res.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: res.user.isActive } : u))
        );
      }
    } catch (err) {
      showError(err.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">User Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Manage System Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee user accounts, verify hospital authorizations, and enforce security policies
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All Users', value: '' },
            { label: 'Donors', value: 'donor' },
            { label: 'Hospitals', value: 'hospital' },
            { label: 'Admins', value: 'admin' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRoleFilter(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === item.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search by user or hospital name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs border-none focus:outline-none text-slate-800"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No User Accounts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No donors or hospital accounts have registered on the system yet. As users sign up, their profiles will appear here for oversight.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Matching Users</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No user accounts match your active role filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-5">User / Facility</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Key Attributes</th>
                  <th className="py-3 px-5">Account Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isToggling = togglingId === u._id;
                  const details = u.profileDetails;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'hospital'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Shield className="w-4 h-4" />
                            ) : u.role === 'hospital' ? (
                              <Hospital className="w-4 h-4" />
                            ) : (
                              <Heart className="w-4 h-4 fill-current" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">
                              Registered: {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600">{u.email}</td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'hospital'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600">
                        {u.role === 'donor' && details && (
                          <div className="text-[11px]">
                            Blood: <strong className="text-red-600">{details.bloodGroup}</strong> • {details.city}
                          </div>
                        )}
                        {u.role === 'hospital' && details && (
                          <div className="text-[11px]">
                            {details.hospitalType} • {details.city} (Lic: {details.registrationNumber})
                          </div>
                        )}
                        {u.role === 'admin' && <span className="text-[11px] text-slate-400">Full System Root</span>}
                      </td>

                      <td className="py-3.5 px-5">
                        {u.isActive ? (
                          <span className="inline-flex items-center text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-700 font-bold">
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isToggling}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            u.isActive
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          } disabled:opacity-50`}
                        >
                          {isToggling ? 'Updating...' : u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
