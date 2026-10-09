import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmployeeDashboardData, Task } from '../../types';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  ArrowRight,
} from 'lucide-react';

interface EmployeeDashboardPageProps {
  onGoToTasks: () => void;
  onViewTask: (id: number) => void;
}

export const EmployeeDashboardPage: React.FC<EmployeeDashboardPageProps> = ({
  onGoToTasks,
  onViewTask,
}) => {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEmployeeDashboard()
      .then(res => setData(res))
      .catch(err => console.error('Failed loading employee dashboard', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400 text-sm">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading employee dashboard...
      </div>
    );
  }

  const counts = data?.counts || {
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    noOutput: 0,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
            Work Progress Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Summary of your current assignments, outputs recorded, and completion rates.
          </p>
        </div>

        <button
          onClick={onGoToTasks}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs cursor-pointer"
        >
          <span>Open My Tasks Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Metric Cards Grid - Clean White with Gold Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono tabular-nums">
            {counts.totalTasks}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Assigned to you</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-700 font-mono tabular-nums">
            {counts.pending}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Not started yet</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {counts.inProgress}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Work ongoing</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {counts.completed}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Delivered output</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 bg-amber-50/30 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">No Output</span>
            <FileQuestion className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
            {counts.noOutput}
          </div>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Needs update</span>
        </div>

        <div className="p-4 bg-white border border-rose-200 bg-rose-50/30 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
            {counts.overdue}
          </div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Urgent priority</span>
        </div>
      </div>

      {/* Today's Tasks List */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-display">
              Today's Assigned Tasks
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review current assignments and jump in to type your output.
            </p>
          </div>
          <button
            onClick={onGoToTasks}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Go to My Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {data?.tasks && data.tasks.length > 0 ? (
            data.tasks.map(task => {
              const hasOutput = task.employee_output && task.employee_output.trim().length > 0;
              return (
                <div key={task.id} className="p-4 hover:bg-zinc-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono font-bold text-amber-700">Task #{task.id}</span>
                      <span>·</span>
                      <span>Due: {task.due_date}</span>
                      <span>·</span>
                      <span className={`font-semibold ${
                        task.priority === 'Urgent' ? 'text-rose-700 font-bold' : task.priority === 'High' ? 'text-amber-700 font-bold' : 'text-zinc-600'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900">{task.title}</h3>

                    <p className="text-xs text-zinc-600 line-clamp-1">{task.description}</p>

                    <div className="pt-1 text-xs">
                      {hasOutput ? (
                        <div className="text-zinc-800 bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 text-[11px]">
                          <strong className="text-amber-800">Your Output:</strong> {task.employee_output}
                        </div>
                      ) : (
                        <span className="text-amber-700 italic text-[11px]">
                          No output entered yet. Click "Update Output" to add your work.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : task.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {task.status} ({task.progress}%)
                    </span>

                    <button
                      onClick={() => onViewTask(task.id)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                    >
                      Update Output →
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No tasks currently assigned.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
