import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee, Task, TaskPriority, TaskStatus } from '../types';
import { X, Save, Edit3, AlertCircle } from 'lucide-react';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      api.getEmployees()
        .then(list => setEmployees(list))
        .catch(err => console.error('Failed to load employees for edit', err));
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssignedEmployeeId(task.assigned_employee_id || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'Pending');
      setDueDate(task.due_date || '');
      setProgress(task.progress ?? 0);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task Title is required');
      return;
    }
    if (!assignedEmployeeId) {
      setError('Please select an assigned employee');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        assigned_employee_id: assignedEmployeeId,
        priority,
        status,
        due_date: dueDate,
        progress: Math.min(100, Math.max(0, Number(progress))),
      });

      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 relative text-zinc-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Task #{task.id}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Created by {task.created_by}
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 font-display flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-500" />
            <span>Edit Task Details</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Admin can update task title, instructions, assigned employee, priority, status, and deadlines.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Title <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Design Marketing Poster"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Assign / Reassign Employee <span className="text-amber-600">*</span>
            </label>
            <select
              value={assignedEmployeeId}
              onChange={e => setAssignedEmployeeId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              required
            >
              <option value="" disabled>Select an employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.job_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Description &amp; Work Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what employee should do..."
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => {
                  const newStat = e.target.value as TaskStatus;
                  setStatus(newStat);
                  if (newStat === 'Completed') {
                    setProgress(100);
                  }
                }}
                className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1">
                <span>Progress</span>
                <span className="font-mono text-amber-700 font-bold">{progress}%</span>
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={e => setProgress(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all disabled:opacity-60 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
