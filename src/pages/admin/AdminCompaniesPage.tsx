import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Company, Employee } from '../../types';
import { Building2, Plus, Mail, Phone } from 'lucide-react';

interface AdminCompaniesPageProps {
  onOpenCreateCompany: () => void;
}

export const AdminCompaniesPage: React.FC<AdminCompaniesPageProps> = ({ onOpenCreateCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, eList] = await Promise.all([api.getCompanies(), api.getEmployees()]);
      setCompanies(cList);
      setEmployees(eList);
    } catch (err) {
      console.error('Failed loading companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (comp: Company) => {
    const nextStatus = comp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await api.updateCompany(comp.id, { status: nextStatus });
      setCompanies(prev => prev.map(c => (c.id === comp.id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed updating company status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
            Companies &amp; Organizations
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage corporate divisions, client entities, and their employee associations.
          </p>
        </div>

        <button
          onClick={onOpenCreateCompany}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Create Company</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-xs text-left">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No companies created yet.
                  </td>
                </tr>
              ) : (
                companies.map(comp => {
                  const empCount = employees.filter(e => e.company_id === comp.id).length;
                  return (
                    <tr key={comp.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{comp.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {comp.code}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 space-y-0.5">
                        {comp.email && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            <span>{comp.email}</span>
                          </div>
                        )}
                        {comp.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{comp.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums text-zinc-700 font-semibold">
                        {empCount} {empCount === 1 ? 'member' : 'members'}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 max-w-xs truncate" title={comp.address}>
                        {comp.address || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            comp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(comp)}
                          className="text-xs text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                        >
                          {comp.status === 'Active' ? 'Deactivate' : 'Activate'}
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
