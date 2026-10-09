import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee, TaskPriority, TaskStatus } from '../types';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  initialEmployeeId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  initialEmployeeId,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployeeId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('2026-10-07');
  const [status, setStatus] = useState<TaskStatus>('Pending');

  useEffect(() => {
    if (isOpen) {
      api.getEmployees()
        .then(data => {
          setEmployees(data);
          if (!selectedEmployeeId && data.length > 0) {
            setSelectedEmployeeId(initialEmployeeId || data[0].id);
          }
        })
        .catch(err => console.error('Failed loading employees', err));
      setError(null);
    }
  }, [isOpen, initialEmployeeId]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }
    if (!title.trim()) {
      setError('Task Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createTask({
        assigned_employee_id: selectedEmployeeId,
        company_id: selectedEmployee?.company_id,
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate,
        status,
      });

      setTitle('');
      setDescription('');
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
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
          <h2 className="text-lg font-bold text-zinc-900 font-display flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            + Create Task
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Assign work instructions to an employee. They will be notified upon login.
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
              Assign Employee <span className="text-amber-600">*</span>
            </label>
            {employees.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 leading-relaxed">
                No employees registered yet. Go to the <strong>Employees</strong> tab and create an employee first, then return here to assign tasks.
              </div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
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
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Title <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Create today's Instagram poster"
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Description (What you want employee to do)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Create today's Python Full Stack course promotional poster and send for review."
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full text-sm px-3 py-2 bg-white text-zinc-900 border border-zinc-300 rounded-md focus:border-amber-500 focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
            </select>
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
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{loading ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
