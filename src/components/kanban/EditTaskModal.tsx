import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  Flag,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { useDispatch } from 'react-redux';
import { updateTaskLocal } from '../../redux/slides/task/taskSlide';
import type { ProjectTask } from '../../types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTask | null;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const dispatch = useDispatch();
  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  // Khởi tạo state trực tiếp từ prop task.
  // Khi task thay đổi, parent sẽ truyền một key mới để remount component này.
  const [formData, setFormData] = useState({
    name: task?.name || '',
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : '',
    estimated: task?.estimated || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'None',
  });

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const updatedTask = await updateTask({
        id: task._id || (task.id as string),
        data: {
          name: formData.name,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : undefined,
          estimated: formData.estimated,
          priority: formData.priority,
          status: formData.status,
        },
      }).unwrap();

      // Đồng bộ local state
      dispatch(
        updateTaskLocal({
          id: task._id || (task.id as string),
          data: updatedTask,
        }),
      );

      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const statusConfigs = [
    { value: 'None', label: 'Backlog', color: 'bg-slate-100 text-slate-500' },
    { value: 'Pending', label: 'To Do', color: 'bg-blue-100 text-blue-600' },
    {
      value: 'Doing',
      label: 'In Progress',
      color: 'bg-amber-100 text-amber-600',
    },
    { value: 'Stuck', label: 'Review', color: 'bg-rose-100 text-rose-600' },
    { value: 'Done', label: 'Done', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                Chỉnh sửa công việc
                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-widest font-black border border-slate-200">
                  Edit Mode
                </span>
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Cập nhật thông tin chi tiết cho task
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selector - New Field as requested */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <CheckCircle2 size={12} className="text-indigo-500" />
                Trạng thái hiện tại
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                {statusConfigs.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: s.value })
                    }
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                      formData.status === s.value
                        ? `${s.color} border-current shadow-sm scale-105`
                        : 'bg-white text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Name */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <AlertCircle size={12} className="text-blue-500" />
                Tên công việc
              </label>
              <input
                disabled={isLoading}
                type="text"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white outline-none rounded-2xl px-5 py-4 text-slate-700 font-bold transition-all shadow-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Calendar size={12} className="text-purple-500" />
                  Hạn chót
                </label>
                <input
                  disabled={isLoading}
                  type="date"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-500/20 focus:bg-white outline-none rounded-2xl px-5 py-4 text-slate-700 font-bold transition-all shadow-sm"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              {/* Estimated */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Clock size={12} className="text-emerald-500" />
                  Dự kiến
                </label>
                <input
                  disabled={isLoading}
                  type="text"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white outline-none rounded-2xl px-5 py-4 text-slate-700 font-bold transition-all shadow-sm"
                  value={formData.estimated}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Flag size={12} className="text-amber-500" />
                Mức độ ưu tiên
              </label>
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    disabled={isLoading}
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      formData.priority === p
                        ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                disabled={isLoading}
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[12px]"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isLoading}
                type="submit"
                className="flex-[1.5] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 uppercase tracking-widest text-[12px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};
