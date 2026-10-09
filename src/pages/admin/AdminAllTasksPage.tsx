import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Company, Employee, Task, TaskPriority, TaskStatus } from '../../types';
import { formatDateTime } from '../../utils/date';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  AlertCircle,
  Building,
  Edit3,
  Clock,
} from 'lucide-react';

interface AdminAllTasksPageProps {
  onOpenCreateTask: (employeeId?: string) => void;
  onViewTask: (id: number) => void;
  onViewOutput: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  initialFilters?: { status?: string; output_filter?: string };
}

export const AdminAllTasksPage: React.FC<AdminAllTasksPageProps> = ({
  onOpenCreateTask,
  onViewTask,
  onViewOutput,
  onEditTask,
  initialFilters,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialFilters?.status || 'All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedOutputFilter, setSelectedOutputFilter] = useState(initialFilters?.output_filter || 'all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tList, eList, cList] = await Promise.all([
        api.getTasks({
          search: searchTerm,
          employee_id: selectedEmployee || undefined,
          company_id: selectedCompany || undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          priority: selectedPriority !== 'All' ? selectedPriority : undefined,
          output_filter: selectedOutputFilter !== 'all' ? selectedOutputFilter : undefined,
          date_filter: selectedDateFilter !== 'all' ? selectedDateFilter : undefined,
        }),
        api.getEmployees(),
        api.getCompanies(),
      ]);
      setTasks(tList);
      setEmployees(eList);
      setCompanies(cList);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    selectedEmployee,
    selectedCompany,
    selectedStatus,
    selectedPriority,
    selectedOutputFilter,
    selectedDateFilter,
  ]);

  useEffect(() => {
    const handleRefresh = () => loadData();
    window.addEventListener('task-created', handleRefresh);
    window.addEventListener('task-updated', handleRefresh);
    return () => {
      window.removeEventListener('task-created', handleRefresh);
      window.removeEventListener('task-updated', handleRefresh);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('');
    setSelectedCompany('');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedOutputFilter('all');
    setSelectedDateFilter('all');
  };

  const handleInlineUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updated } : t)));
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm(`Are you sure you want to delete Task #${taskId}?`)) return;
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleClearAllTasks = async () => {
    if (!window.confirm('Delete ALL tasks in the system? This will clear all tasks so you can enter tasks manually from scratch.')) return;
    try {
      setLoading(true);
      await api.clearAllTasks();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to clear tasks');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedEmployee) ||
    Boolean(selectedCompany) ||
    selectedStatus !== 'All' ||
    selectedPriority !== 'All' ||
    selectedOutputFilter !== 'all' ||
    selectedDateFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
              All Tasks Spreadsheet
            </h1>
            <span className="font-mono text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded font-bold tabular-nums">
              {tasks.length} total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Spreadsheet-style workspace to monitor instructions, outputs, status, and assignments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {tasks.length > 0 && (
            <button
              onClick={handleClearAllTasks}
              className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
              title="Delete all tasks to start with a clean workspace"
            >
              Clear All Tasks
            </button>
          )}

          <button
            onClick={() => onOpenCreateTask()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR - Clean White with Gold Accents */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search across employee name, email, task title, description, output, company..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-md text-xs text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black text-xs font-bold rounded-md transition-all shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-zinc-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Companies</option>
              {companies.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Output Added
            </label>
            <select
              value={selectedOutputFilter}
              onChange={e => setSelectedOutputFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="with_output">Output Added</option>
              <option value="no_output">No Output (Pending Work)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Date Filter
            </label>
            <select
              value={selectedDateFilter}
              onChange={e => setSelectedDateFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="text-zinc-500">Active filters applied</span>
            <button
              onClick={clearFilters}
              className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* SPREADSHEET-STYLE TABLE */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-xs text-left">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3 px-3.5 w-14 font-mono text-center">ID</th>
                <th className="py-3 px-3.5 min-w-[150px]">Employee</th>
                <th className="py-3 px-3.5 min-w-[220px]">Task Instructions</th>
                <th className="py-3 px-3.5 min-w-[240px]">Employee Output</th>
                <th className="py-3 px-3.5 min-w-[120px]">Status</th>
                <th className="py-3 px-3.5 min-w-[100px]">Priority</th>
                <th className="py-3 px-3.5 min-w-[110px]">Progress</th>
                <th className="py-3 px-3.5 min-w-[100px]">Due Date</th>
                <th className="py-3 px-3.5 min-w-[170px]">Submission Date &amp; Time</th>
                <th className="py-3 px-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    Loading task records...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-zinc-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <p className="font-bold text-base text-zinc-900 font-display">No tasks yet</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        The workspace is clean. Type and assign work instructions manually to any employee to get started.
                      </p>
                      <button
                        onClick={() => onOpenCreateTask()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ Create Your First Task</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map(task => {
                  const hasOutput = task.employee_output && task.employee_output.trim().length > 0;
                  const isOverdue =
                    task.status !== 'Completed' &&
                    task.status !== 'Cancelled' &&
                    task.due_date < '2026-10-07';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-zinc-700 tabular-nums">
                        #{task.id}
                      </td>

                      {/* Employee */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {task.employee_avatar ? (
                            <img
                              src={task.employee_avatar}
                              alt={task.employee_name}
                              className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-[10px] text-zinc-700 shrink-0">
                              {(task.employee_name || 'EM').substring(0, 2)}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="font-bold text-zinc-900 block truncate">
                              {task.employee_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Building className="w-2.5 h-2.5" />
                              <span className="truncate">{task.company_name}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Task Instructions */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <button
                          onClick={() => onViewTask(task.id)}
                          className="text-left group-hover:text-amber-800 transition-colors w-full cursor-pointer"
                        >
                          <span className="font-medium text-zinc-900 block truncate" title={task.title}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-[11px] text-zinc-500 block truncate mt-0.5" title={task.description}>
                              {task.description}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Employee Output */}
                      <td className="py-3 px-3.5 max-w-sm">
                        {hasOutput ? (
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-zinc-800 truncate leading-relaxed select-text"
                              title={task.employee_output}
                            >
                              {task.employee_output}
                            </span>
                            <button
                              onClick={() => onViewOutput(task)}
                              className="text-amber-700 hover:text-amber-900 text-[11px] font-bold whitespace-nowrap underline shrink-0 cursor-pointer"
                            >
                              View Output
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-amber-700/80 italic text-[11px]">
                            No output submitted yet
                          </span>
                        )}
                      </td>

                      {/* Status (Inline editable) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={e => handleInlineUpdate(task.id, { status: e.target.value as TaskStatus })}
                          className={`text-xs font-semibold px-2 py-1 rounded border border-zinc-200 bg-white focus:border-amber-500 focus:outline-none transition-colors ${
                            task.status === 'Completed'
                              ? 'text-emerald-700 bg-emerald-50/50'
                              : task.status === 'In Progress'
                              ? 'text-amber-700 bg-amber-50/50'
                              : task.status === 'Pending'
                              ? 'text-zinc-700 bg-zinc-50'
                              : task.status === 'On Hold'
                              ? 'text-purple-700 bg-purple-50/50'
                              : 'text-zinc-500'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Priority (Inline editable) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={task.priority}
                          onChange={e => handleInlineUpdate(task.id, { priority: e.target.value as TaskPriority })}
                          className={`text-xs font-semibold px-2 py-1 rounded border border-zinc-200 bg-white focus:border-amber-500 focus:outline-none transition-colors ${
                            task.priority === 'Urgent'
                              ? 'text-rose-700 font-bold'
                              : task.priority === 'High'
                              ? 'text-amber-700 font-bold'
                              : 'text-zinc-700'
                          }`}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </td>

                      {/* Progress (Inline slider) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={task.progress}
                            onChange={e => handleInlineUpdate(task.id, { progress: Number(e.target.value) })}
                            className="w-16 accent-amber-500 h-1 bg-zinc-200 rounded cursor-pointer"
                          />
                          <span className="font-mono text-[11px] text-zinc-700 tabular-nums font-bold w-8 text-right">
                            {task.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] tabular-nums">
                        <span className={isOverdue ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-zinc-600'}>
                          {task.due_date}
                          {isOverdue && <span className="text-[10px] font-sans uppercase">!</span>}
                        </span>
                      </td>

                      {/* Submission Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {task.submitted_at ? (
                          <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="tabular-nums">{formatDateTime(task.submitted_at)}</span>
                          </div>
                        ) : task.completed_at ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="tabular-nums">{formatDateTime(task.completed_at)}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500">
                            Pending Submission
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTask?.(task)}
                            className="p-1.5 text-zinc-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            title="Edit Task Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewTask(task.id)}
                            className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                            title="View Full Task Details & Activity History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
