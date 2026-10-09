import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateTask?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenCreateTask }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isLead = user.role === 'TEAM_LEAD';
  const isManager = isAdmin || isLead;

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'all-tasks', label: 'All Tasks' },
    { id: 'companies', label: 'Companies' },
    { id: 'employees', label: 'Employees' },
  ];

  const leadNav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'all-tasks', label: 'All Tasks' },
    { id: 'employees', label: 'Employees' },
  ];

  const employeeNav = [
    { id: 'employee-tasks', label: 'My Tasks' },
    { id: 'employee-dashboard', label: 'Overview' },
    { id: 'employee-profile', label: 'Profile' },
  ];

  const navLinks = isAdmin ? adminNav : isLead ? leadNav : employeeNav;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text wordmark with golden accent */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onTabChange(isManager ? 'dashboard' : 'employee-tasks')}
              className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
                <span className="font-display font-black text-black text-xs tracking-tighter">A</span>
              </div>
              <span className="font-display text-lg font-extrabold tracking-widest text-black group-hover:text-amber-600 transition-colors">
                Am<span className="text-amber-500">Nexus</span>
              </span>
            </button>

            {/* Zone 2: Clean text navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
              {navLinks.map(link => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onTabChange(link.id)}
                    className={`whitespace-nowrap transition-all py-1.5 border-b-2 cursor-pointer ${
                      isActive
                        ? 'border-amber-500 text-black font-bold'
                        : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {isManager && onOpenCreateTask && (
              <button
                onClick={onOpenCreateTask}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all whitespace-nowrap shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create Task</span>
              </button>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
              {user.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-500/50 ring-1 ring-amber-500/20"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-amber-500/50 flex items-center justify-center text-xs font-bold text-amber-700">
                  {user.full_name.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-900 leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center text-amber-600 font-semibold">
                      <ShieldCheck className="w-3 h-3 mr-0.5 text-amber-500" /> Admin
                    </span>
                  ) : isLead ? (
                    <span className="inline-flex items-center text-amber-700 font-bold">
                      <ShieldCheck className="w-3 h-3 mr-0.5 text-amber-500" /> Team Lead
                    </span>
                  ) : (
                    <span className="text-zinc-500">Employee</span>
                  )}
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav links row */}
        <div className="md:hidden flex items-center gap-3 py-2 border-t border-zinc-100 overflow-x-auto text-xs font-semibold">
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
