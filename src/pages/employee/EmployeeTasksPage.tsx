import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Task, TaskStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/date';
import {
  CheckCircle2,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Building,
  History,
  Clock,
} from 'lucide-react';

interface EmployeeTasksPageProps {
  onViewTaskDetails: (id: number) => void;
}

export const EmployeeTasksPage: React.FC<EmployeeTasksPageProps> = ({ onViewTaskDetails }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-task drafts and states
  const [outputDrafts, setOutputDrafts] = useState<Record<number, string>>({});
  const [savingOutputs, setSavingOutputs] = useState<Record<number, boolean>>({});
  const [savingStatus, setSavingStatus] = useState<Record<number, boolean>>({});
  const [notifications, setNotifications] = useState<Record<number, string>>({});

  const [filterStatus, setFilterStatus] = useState<string>('All');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks({
        status: filterStatus !== 'All' ? filterStatus : undefined,
      });
      setTasks(data);

      const drafts: Record<number, string> = {};
      data.forEach(t => {
        drafts[t.id] = t.employee_output || '';
      });
      setOutputDrafts(drafts);
    } catch (err: any) {
      setError(err.message || 'Failed loading tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterStatus]);

  useEffect(() => {
    const handleRefresh = () => loadTasks();
    window.addEventListener('task-created', handleRefresh);
    window.addEventListener('task-updated', handleRefresh);
    return () => {
      window.removeEventListener('task-created', handleRefresh);
      window.removeEventListener('task-updated', handleRefresh);
    };
  }, []);

  const handleDraftChange = (taskId: number, text: string) => {
    setOutputDrafts(prev => ({ ...prev, [taskId]: text }));
  };

  const handleSaveOutput = async (taskId: number) => {
    const text = outputDrafts[taskId] || '';
    setSavingOutputs(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await api.submitOutput(taskId, text);
      setTasks(prev => prev.map(t => (t.id === taskId ? res.task : t)));
      setNotifications(prev => ({ ...prev, [taskId]: 'Output saved successfully!' }));
      setTimeout(() => {
        setNotifications(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Failed saving output');
    } finally {
      setSavingOutputs(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleMarkCompleted = async (taskId: number) => {
    setSavingStatus(prev => ({ ...prev, [taskId]: true }));
    try {
      const draft = outputDrafts[taskId] || '';
      const currentTask = tasks.find(t => t.id === taskId);
      if (draft !== (currentTask?.employee_output || '')) {
        await api.submitOutput(taskId, draft);
      }
      const res = await api.updateTaskStatus(taskId, 'Completed', 100);
      setTasks(prev => prev.map(t => (t.id === taskId ? res.task : t)));
      setNotifications(prev => ({ ...prev, [taskId]: 'Task marked as Completed! Great job!' }));
      setTimeout(() => {
        setNotifications(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Failed updating status');
    } finally {
      setSavingStatus(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleStatusChange = async (taskId: number, nextStatus: TaskStatus) => {
    try {
      const res = await api.updateTaskStatus(taskId, nextStatus);
      setTasks(prev => prev.map(t => (t.id === taskId ? res.task : t)));
    } catch (err: any) {
      alert(err.message || 'Failed updating status');
    }
  };

  const handleProgressChange = async (taskId: number, nextProgress: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const res = await api.updateTask(taskId, { progress: nextProgress });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...res } : t)));
    } catch (err: any) {
      console.error('Failed updating progress', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Employee Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-display">My Tasks Workspace</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Active Session
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Review manager instructions, type your completed work in <strong className="text-amber-700">My Output</strong>, and update task progress.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600">Filter:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-white text-zinc-800 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-zinc-400 text-sm">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading assigned tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 bg-white border border-zinc-200 rounded-xl text-center space-y-2 shadow-2xs">
          <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800">No tasks assigned</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You do not have any tasks matching this filter. Any tasks created by your manager will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map(task => {
            const isSavingOut = savingOutputs[task.id] || false;
            const isSavingStat = savingStatus[task.id] || false;
            const notification = notifications[task.id];
            const draft = outputDrafts[task.id] ?? '';
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-2xs transition-all ${
                  isCompleted
                    ? 'border-emerald-300'
                    : 'border-zinc-200 hover:border-amber-400'
                }`}
              >
                {/* Task Header Box */}
                <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <span className="font-mono font-bold text-amber-700">Task #{task.id}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-zinc-700">
                        <Building className="w-3 h-3 text-zinc-400" />
                        {task.company_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                            : task.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-zinc-900 leading-snug mb-3">
                    {task.title}
                  </h2>

                  {/* ADMIN TASK INSTRUCTIONS */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-lg text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Task from Admin
                    </span>
                    <p className="text-zinc-800 whitespace-pre-wrap leading-relaxed">
                      {task.description || '(No additional instructions provided)'}
                    </p>
                  </div>

                  {/* Task Meta Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-zinc-200/60 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Due Date</span>
                      <span className="font-mono font-medium text-zinc-900 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        {task.due_date}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-500 block">Status Transition</span>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="text-xs font-semibold px-2 py-1 bg-white text-zinc-800 border border-zinc-300 rounded mt-0.5 focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-0.5">
                        <span>Progress</span>
                        <span className="font-mono font-bold text-amber-700">{task.progress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={task.progress}
                        onChange={e => handleProgressChange(task.id, Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-zinc-200 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* EMPLOYEE OUTPUT SECTION */}
                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>My Output</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {task.submitted_at ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Submitted: {formatDateTime(task.submitted_at)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-medium">
                          Not submitted yet
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500">
                    Type what you have done or completed for this task. Admin will see this immediately:
                  </p>

                  <textarea
                    rows={4}
                    value={draft}
                    onChange={e => handleDraftChange(task.id, e.target.value)}
                    placeholder="Type what you have done... e.g. Instagram poster completed and uploaded to marketing folder."
                    className="w-full text-sm p-3.5 border border-zinc-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none bg-white text-zinc-900 placeholder-zinc-400 leading-relaxed font-sans transition-colors"
                  />

                  {notification && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-semibold flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{notification}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleSaveOutput(task.id)}
                        disabled={isSavingOut}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isSavingOut ? 'Saving Output...' : 'Save Output'}</span>
                      </button>

                      {!isCompleted && (
                        <button
                          onClick={() => handleMarkCompleted(task.id)}
                          disabled={isSavingStat}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isSavingStat ? 'Completing...' : 'Mark Completed'}</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onViewTaskDetails(task.id)}
                      className="text-xs text-zinc-600 hover:text-black flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>View Full Activity History</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
