import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const QUICK_USERS = [
  { label: 'Admin (Manager)', email: 'admin@example.com', role: 'ADMIN' },
  { label: 'Team Lead', email: 'teamlead@example.com', role: 'TEAM_LEAD' },
  { label: 'Savad (Employee)', email: 'savad@example.com', role: 'EMPLOYEE' },
  { label: 'Rahul (Employee)', email: 'rahul@example.com', role: 'EMPLOYEE' },
  { label: 'Fadil (Employee)', email: 'fadil@example.com', role: 'EMPLOYEE' },
  { label: 'Anu (Employee)', email: 'anu@example.com', role: 'EMPLOYEE' },
];

export const QuickUserSwitcher: React.FC<{ onUserSwitched?: () => void }> = ({ onUserSwitched }) => {
  const { user, switchQuickUser } = useAuth();
  const [switching, setSwitching] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  const handleSwitch = async (email: string) => {
    if (user?.email === email || switching) return;
    setSwitching(true);
    try {
      await switchQuickUser(email);
      if (onUserSwitched) onUserSwitched();
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleResetData = async () => {
    if (resetting) return;
    if (!window.confirm('Reset database? This will clear tasks and reset sample users and companies to initial state.')) return;
    setResetting(true);
    try {
      await api.resetData();
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-white border-b border-zinc-200 text-zinc-700 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2">
        <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-bold text-zinc-800">Switch Account (Test Roles):</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_USERS.map(qu => {
            const isActive = user?.email.toLowerCase() === qu.email.toLowerCase();
            return (
              <button
                key={qu.email}
                onClick={() => handleSwitch(qu.email)}
                disabled={switching}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs font-bold'
                    : 'bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-black'
                }`}
                title={`Switch to ${qu.label}`}
              >
                {qu.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-700 hover:bg-zinc-100 border border-transparent px-2 py-1 rounded transition-colors cursor-pointer"
          title="Reset database to original sample tasks and users"
        >
          <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin text-amber-600' : ''}`} />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </div>
  );
};
