import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Company, Employee } from '../../types';
import { UserPlus, KeyRound, Plus, Building, Mail, Phone, Trash2 } from 'lucide-react';

interface AdminEmployeesPageProps {
  onOpenCreateEmployee: () => void;
  onOpenResetPassword: (employee: Employee) => void;
  onAssignTask: (employeeId: string) => void;
}

export const AdminEmployeesPage: React.FC<AdminEmployeesPageProps> = ({
  onOpenCreateEmployee,
  onOpenResetPassword,
  onAssignTask,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eList, cList] = await Promise.all([api.getEmployees(), api.getCompanies()]);
      setEmployees(eList);
      setCompanies(cList);
    } catch (err) {
      console.error('Failed loading employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This will remove their account and credentials.`)) return;
    try {
      await api.deleteEmployee(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
            Employee Directory &amp; Accounts
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Admin can create and manage any number of employee profiles and access accounts.
          </p>
        </div>

        <button
          onClick={onOpenCreateEmployee}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Create Employee</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-xs text-left">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Job Title &amp; Dept</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                        <UserPlus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <p className="font-bold text-base text-zinc-900 font-display">No employees created yet</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        The directory is clean. You can create any number of employees and assign tasks with deadlines.
                      </p>
                      <button
                        onClick={onOpenCreateEmployee}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ Create Employee Now</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map(emp => {
                  const company = companies.find(c => c.id === emp.company_id);
                  return (
                    <tr key={emp.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {emp.profile_photo ? (
                            <img
                              src={emp.profile_photo}
                              alt={emp.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700">
                              {emp.full_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-zinc-900 block">
                              {emp.full_name}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {emp.employee_code}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{company?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-900 block">{emp.job_title}</span>
                        <span className="text-[11px] text-zinc-500">{emp.department}</span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span>{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => onAssignTask(emp.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded transition-all shadow-xs cursor-pointer"
                          title="Assign a new task to this employee"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Assign Task</span>
                        </button>

                        <button
                          onClick={() => onOpenResetPassword(emp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded transition-colors cursor-pointer"
                          title="Reset employee login password"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>Reset Pass</span>
                        </button>

                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                          title="Delete this employee profile"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
