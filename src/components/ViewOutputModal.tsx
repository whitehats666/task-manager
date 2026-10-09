import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { Task } from '../types';
import { formatDateTime } from '../utils/date';

interface ViewOutputModalProps {
  task: Task | null;
  onClose: () => void;
}

export const ViewOutputModal: React.FC<ViewOutputModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  const hasOutput = task.employee_output && task.employee_output.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-xl w-full p-6 relative text-zinc-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-1">
            <span className="font-mono font-bold text-amber-700">Task #{task.id}</span>
            <span>·</span>
            <span className="text-zinc-800 font-semibold">{task.employee_name || 'Assigned Employee'}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Submitted: {formatDateTime(task.submitted_at || task.updated_at)}
            </span>
          </div>
          <h2 className="text-base font-bold text-zinc-900 leading-snug font-display">
            {task.title}
          </h2>
        </div>

        <div className="mb-5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
            Admin Task Instructions
          </label>
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">
            {task.description || '(No additional description provided)'}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-600" />
              <span>Employee Output</span>
            </label>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Status: {task.status}</span>
            </span>
          </div>

          {hasOutput ? (
            <div className="p-4 bg-amber-50/30 border border-amber-300 rounded-lg text-sm text-zinc-900 whitespace-pre-wrap font-sans leading-relaxed">
              {task.employee_output}
            </div>
          ) : (
            <div className="p-6 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg text-center text-xs text-amber-800">
              <p className="font-semibold mb-0.5">No output submitted yet</p>
              <p className="text-zinc-500 text-[11px]">
                {task.employee_name} has not entered their completed work for this task.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-md transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
