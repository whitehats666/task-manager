import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminDashboardData, Task } from '../../types';
import { formatDateTime } from '../../utils/date';
import {
  Users,
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onOpenCreateTask: () => void;
  onNavigateToTasks: (filter?: { status?: string; output_filter?: string }) => void;
  onViewTask: (id: number) => void;
  onViewOutput: (task: Task) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onOpenCreateTask,
  onNavigateToTasks,
  onViewTask,
  onViewOutput,
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed loading admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-400 text-sm">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading AMNEXUS console metrics...</span>
      </div>
    );
  }

  const counts = data?.counts || {
    totalEmployees: 0,
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0,
    cancelled: 0,
    noOutput: 0,
    overdue: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
              Admin Operations Console
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Live Overview
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time status overview of company task assignments and employee outputs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTasks()}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-amber-400/80 hover:border-amber-500 hover:bg-amber-50/40 rounded-md transition-colors cursor-pointer"
          >
            Open All Tasks
          </button>
          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Clean White with Gold Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <button
          onClick={() => onNavigateToTasks()}
          className="p-4 bg-white border border-zinc-200 hover:border-amber-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Employees</span>
            <Users className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono tabular-nums">
            {counts.totalEmployees}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Active members</span>
        </button>

        <button
          onClick={() => onNavigateToTasks()}
          className="p-4 bg-white border border-zinc-200 hover:border-amber-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono tabular-nums">
            {counts.totalTasks}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">All company tasks</span>
        </button>

        <button
          onClick={() => onNavigateToTasks({ status: 'Pending' })}
          className="p-4 bg-white border border-zinc-200 hover:border-amber-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {counts.pending}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Awaiting start</span>
        </button>

        <button
          onClick={() => onNavigateToTasks({ status: 'In Progress' })}
          className="p-4 bg-white border border-zinc-200 hover:border-amber-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">In Progress</span>
            <PlayCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {counts.inProgress}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Being worked on</span>
        </button>

        <button
          onClick={() => onNavigateToTasks({ status: 'Completed' })}
          className="p-4 bg-white border border-zinc-200 hover:border-emerald-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {counts.completed}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Finished tasks</span>
        </button>

        <button
          onClick={() => onNavigateToTasks({ output_filter: 'no_output' })}
          className="p-4 bg-white border border-amber-200 bg-amber-50/30 hover:border-amber-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">No Output</span>
            <FileQuestion className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
            {counts.noOutput}
          </div>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Output not added</span>
        </button>

        <button
          onClick={() => onNavigateToTasks()}
          className="p-4 bg-white border border-rose-200 bg-rose-50/30 hover:border-rose-400 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
            {counts.overdue}
          </div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Past due date</span>
        </button>
      </div>

      {/* Today's Employee Work Section */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-display">
              Today's Employee Work
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live updates and outputs submitted by team members today.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTasks()}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View All in Spreadsheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 text-xs text-left">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Output</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {data?.todayWork && data.todayWork.length > 0 ? (
                data.todayWork.map(item => {
                  const hasOutput = item.output && item.output.trim().length > 0;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {item.employee_avatar ? (
                            <img
                              src={item.employee_avatar}
                              alt={item.employee_name}
                              className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-[10px] text-zinc-700">
                              {item.employee_name.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-zinc-900 block">
                              {item.employee_name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {item.company_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-zinc-800 block truncate" title={item.task_title}>
                          {item.task_title}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        {hasOutput ? (
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-700 truncate" title={item.output}>
                              {item.output}
                            </span>
                            <button
                              onClick={() =>
                                onViewOutput({
                                  id: item.id,
                                  title: item.task_title,
                                  employee_output: item.output,
                                  status: item.status,
                                  submitted_at: item.submitted_at,
                                  updated_at: item.updated_at,
                                  employee_name: item.employee_name,
                                } as any)
                              }
                              className="text-amber-700 hover:text-amber-900 text-[11px] font-bold whitespace-nowrap underline cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-amber-600 italic text-[11px]">No output added</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.submitted_at ? (
                          <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="tabular-nums">{formatDateTime(item.submitted_at)}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">Not Submitted</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                item.progress === 100
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-zinc-600 tabular-nums font-semibold">
                            {item.progress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => onViewTask(item.id)}
                          className="inline-flex items-center gap-1 text-zinc-600 hover:text-black font-semibold p-1 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                          title="View Full Task Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    No employee work recorded today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
