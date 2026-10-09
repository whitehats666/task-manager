import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Mail, Phone, Building, Briefcase, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmployeeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">My Profile &amp; Security</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Review your employee account information and update your login password.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-zinc-100">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50 ring-1 ring-amber-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-100 border border-amber-500/50 flex items-center justify-center font-bold text-lg text-amber-700">
              {user.full_name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-zinc-900">{user.full_name}</h2>
            <p className="text-xs text-zinc-500 font-medium">{user.job_title || 'Team Member'}</p>
            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {user.role} · Active Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-700">
            <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Email</span>
              <span className="text-zinc-900 font-medium">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-700">
            <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Phone</span>
              <span className="text-zinc-900 font-medium">{user.phone || '+1 (555) 000-0000'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-700">
            <Briefcase className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Department</span>
              <span className="text-zinc-900 font-medium">{user.department || 'Engineering'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-700">
            <Building className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Role Access</span>
              <span className="capitalize text-amber-700 font-bold">{user.role.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Change Password</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-md text-zinc-900 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-md text-zinc-900 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-md text-zinc-900 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
