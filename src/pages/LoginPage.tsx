import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle luxury golden radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
            <span className="font-display font-black text-black text-sm tracking-tighter">A</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-black font-display">
            Am<span className="text-amber-500">Nexus</span>
          </h1>
        </div>
        <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
          Employee Task &amp; Output Management System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl shadow-zinc-200/50 rounded-2xl sm:px-10 border border-zinc-200">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-sm shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to AmNexus'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
