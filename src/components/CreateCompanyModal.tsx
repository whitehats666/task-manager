import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Building2, AlertCircle } from 'lucide-react';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: () => void;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Company Name and Code are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createCompany({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        status: 'Active',
      });

      setName('');
      setCode('');
      setEmail('');
      setPhone('');
      setAddress('');
      setWebsite('');
      onCompanyCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 relative text-zinc-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-zinc-900 font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>Create Company</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add a corporate client or organizational entity.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Company Name <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Asquare Technologies"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Company Code <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ASQ"
              maxLength={6}
              className="w-full text-sm px-3 py-2 font-mono uppercase bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="info@company.com"
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
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
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Headquarters address"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://company.com"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
            />
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
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
