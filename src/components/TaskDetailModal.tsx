import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task, TaskActivity, OutputHistoryItem, TaskStatus, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/date';
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  User as UserIcon,
  Save,
  Check,
  History,
  AlertCircle,
  Edit3,
} from 'lucide-react';

interface TaskDetailModalProps {
  taskId: number | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onOpenEditTask?: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
  onTaskUpdated,
  onOpenEditTask,
}) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [outputHistory, setOutputHistory] = useState<OutputHistoryItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingOutput, setSavingOutput] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [outputDraft, setOutputDraft] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const isManager = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';

  const loadData = async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const [tData, actData] = await Promise.all([
        api.getTask(taskId),
        api.getTaskActivity(taskId),
      ]);
      setTask(tData);
      setOutputDraft(tData.employee_output || '');
      setActivities(actData.activities || []);
      setOutputHistory(actData.output_history || []);

      if (isManager) {
        const empList = await api.getEmployees();
        setEmployees(empList);
      }
    } catch (err: any) {
      setError(err.message || 'Failed loading task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [taskId]);

  if (!taskId) return null;

  const handleSaveOutput = async () => {
    if (!task) return;
    setSavingOutput(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.submitOutput(task.id, outputDraft);
      setTask(res.task);
      setSuccessMessage('Output saved successfully!');
      const actData = await api.getTaskActivity(task.id);
      setActivities(actData.activities || []);
      setOutputHistory(actData.output_history || []);
      onTaskUpdated();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed saving output');
    } finally {
      setSavingOutput(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!task) return;
    setSavingStatus(true);
    setError(null);
    try {
      if (outputDraft !== (task.employee_output || '')) {
        await api.submitOutput(task.id, outputDraft);
      }
      const res = await api.updateTaskStatus(task.id, 'Completed', 100);
      setTask(res.task);
      setSuccessMessage('Task marked as Completed!');
      const actData = await api.getTaskActivity(task.id);
      setActivities(actData.activities || []);
      onTaskUpdated();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed updating status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAdminUpdate = async (field: keyof Task, value: any) => {
    if (!task || !isManager) return;
    try {
      const updated = await api.updateTask(task.id, { [field]: value });
      setTask(updated);
      const actData = await api.getTaskActivity(task.id);
      setActivities(actData.activities || []);
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed updating task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[92vh] flex flex-col relative text-zinc-900">
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/50 rounded-t-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <span className="font-mono font-bold text-amber-700">Task #{taskId}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-zinc-400" />
                {task?.company_name || 'Company'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-zinc-900">
                <UserIcon className="w-3 h-3 text-zinc-400" />
                {task?.employee_name || 'Employee'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-zinc-900 leading-snug font-display">
              {task?.title || 'Loading task...'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isManager && task && (
              <button
                onClick={() => onOpenEditTask?.(task)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs cursor-pointer"
                title="Edit Task Details"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Edit Task</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center px-5 border-b border-zinc-200 bg-white gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-amber-500 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Task &amp; Output
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Timeline ({activities.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-zinc-400 text-xs">Loading task details...</div>
          ) : task ? (
            activeTab === 'details' ? (
              <>
                {/* Meta details bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Status</span>
                    {isManager ? (
                      <select
                        value={task.status}
                        onChange={e => handleAdminUpdate('status', e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-white text-zinc-900 border border-zinc-300 rounded focus:border-amber-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className="font-bold text-amber-700">{task.status}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Priority</span>
                    {isManager ? (
                      <select
                        value={task.priority}
                        onChange={e => handleAdminUpdate('priority', e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-white text-zinc-900 border border-zinc-300 rounded focus:border-amber-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    ) : (
                      <span className="font-bold text-zinc-900">{task.priority}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Progress</span>
                    {isManager ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={e => handleAdminUpdate('progress', Number(e.target.value))}
                          className="w-14 text-xs font-mono font-bold px-1.5 py-1 bg-white text-zinc-900 border border-zinc-300 rounded text-center"
                        />
                        <span className="font-mono text-zinc-500">%</span>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-amber-700">{task.progress}%</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Due Date</span>
                    <span className="font-mono font-medium text-zinc-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      {task.due_date}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Submitted At</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="text-[11px] truncate">{formatDateTime(task.submitted_at)}</span>
                    </span>
                  </div>
                </div>

                {/* ADMIN / LEAD TASK INSTRUCTIONS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Work Instructions
                    </label>
                    <div className="flex items-center gap-3">
                      {isManager && task && (
                        <button
                          onClick={() => onOpenEditTask?.(task)}
                          className="text-amber-700 hover:text-amber-900 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Instructions</span>
                        </button>
                      )}
                      <span className="text-[11px] text-zinc-500">
                        Created by {task.created_by}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {task.description || '(No detailed description provided)'}
                  </div>
                </div>

                {/* EMPLOYEE OUTPUT SECTION */}
                <div className="pt-2 border-t border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Employee Output</span>
                    </label>
                    {task.updated_at && (
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        Updated: {task.updated_at.split('T')[0]} {task.updated_at.split('T')[1]?.substring(0, 5)}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 mb-2">
                    {isManager
                      ? `What ${task.employee_name} completed for this task:`
                      : 'Type the work you have completed or status update:'}
                  </p>

                  <textarea
                    rows={4}
                    value={outputDraft}
                    onChange={e => setOutputDraft(e.target.value)}
                    placeholder="Type what you have done... e.g. Poster created and uploaded to marketing folder."
                    className="w-full text-sm p-3 border border-zinc-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none bg-white text-zinc-900 leading-relaxed font-sans"
                  />

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveOutput}
                        disabled={savingOutput}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{savingOutput ? 'Saving...' : 'Save Output'}</span>
                      </button>

                      {task.status !== 'Completed' && (
                        <button
                          onClick={handleMarkCompleted}
                          disabled={savingStatus}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{savingStatus ? 'Updating...' : 'Mark Completed'}</span>
                        </button>
                      )}
                    </div>

                    {!isManager && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500">My Status:</span>
                        <select
                          value={task.status}
                          onChange={e => api.updateTaskStatus(task.id, e.target.value as TaskStatus).then(res => {
                            setTask(res.task);
                            onTaskUpdated();
                          })}
                          className="px-2 py-1 bg-white border border-zinc-300 text-zinc-900 rounded text-xs font-medium"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* ACTIVITY TIMELINE TAB */
              <div className="space-y-4">
                <div className="text-xs text-zinc-500 pb-1 border-b border-zinc-100">
                  Chronological log of changes and status updates for Task #{taskId}:
                </div>

                <div className="relative pl-5 border-l-2 border-zinc-200 space-y-4 my-2">
                  {activities.length === 0 ? (
                    <p className="text-xs text-zinc-400">No activity recorded yet.</p>
                  ) : (
                    activities.map(act => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-2 ring-zinc-200" />
                        <div className="text-xs">
                          <span className="font-mono text-[11px] text-zinc-500 mr-2">
                            {act.created_at.split('T')[0]} {act.created_at.split('T')[1]?.substring(0, 5)}
                          </span>
                          <span className="font-bold text-zinc-900">{act.user_name}</span>
                          <p className="text-zinc-700 text-xs mt-0.5">{act.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {outputHistory.length > 0 && (
                  <div className="pt-4 border-t border-zinc-200">
                    <h3 className="text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
                      Previous Output Revisions ({outputHistory.length})
                    </h3>
                    <div className="space-y-2">
                      {outputHistory.map(hist => (
                        <div key={hist.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                            <span>Edited by {hist.updated_by_name}</span>
                            <span className="font-mono">{hist.updated_at.split('T')[0]} {hist.updated_at.split('T')[1]?.substring(0, 5)}</span>
                          </div>
                          <p className="text-zinc-700 whitespace-pre-wrap">{hist.output_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 rounded-b-xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
