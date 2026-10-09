import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Company } from '../types';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
  onEmployeeCreated,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'TEAM_LEAD'>('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCompanies()
        .then(list => {
          setCompanies(list);
          if (list.length > 0 && !companyId) {
            setCompanyId(list[0].id);
          }
        })
        .catch(err => console.error('Failed loading companies', err));
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !companyId || !password.trim()) {
      setError('Full Name, Email, Company, and Login Password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createEmployee({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        job_title: jobTitle.trim() || (role === 'TEAM_LEAD' ? 'Team Lead' : 'Team Member'),
        department: department.trim() || 'Engineering',
        company_id: companyId,
        password: password.trim(),
        employee_code: employeeCode.trim() || undefined,
        role,
        status: 'Active',
      });

      setFullName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setDepartment('');
      setEmployeeCode('');
      setPassword('');
      setRole('EMPLOYEE');
      onEmployeeCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 relative text-zinc-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-zinc-900 font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <span>Create Employee &amp; Login</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add team member details and generate their secure portal credentials.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Full Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Savad"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Employee Code
              </label>
              <input
                type="text"
                value={employeeCode}
                onChange={e => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="e.g. EMP-105"
                className="w-full text-sm px-3 py-2 font-mono uppercase bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Login Email <span className="text-amber-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="savad@example.com"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Company <span className="text-amber-600">*</span>
            </label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              required
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Account Role &amp; Permissions <span className="text-amber-600">*</span>
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'EMPLOYEE' | 'TEAM_LEAD')}
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none font-medium"
            >
              <option value="EMPLOYEE">Employee (Receives tasks, submits completed work output)</option>
              <option value="TEAM_LEAD">Team Lead (Can assign &amp; enter tasks on employees, view all work)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Full Stack Developer"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Login Password <span className="text-amber-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none font-mono"
              required
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Password is securely masked and encrypted with bcrypt.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
