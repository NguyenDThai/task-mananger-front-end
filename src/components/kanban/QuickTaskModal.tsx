import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Flag, AlertCircle, Loader2 } from 'lucide-react';
import { useCreateTaskMutation } from '../../redux/api/taskApi';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [formData, setFormData] = useState({
    name: '',
    dueDate: '',
    estimated: '',
    priority: 'Medium',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createTask({
        name: formData.name,
        // Backend yêu cầu dueDate bắt buộc, nên nếu không chọn ta lấy ngày hôm nay
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : new Date().toISOString(),
        estimated: formData.estimated,
        priority: formData.priority,
        status: 'None',
      }).unwrap();

      // Đã chuyển logic đồng bộ Redux Slide vào [taskApi.ts]
      // để xử lý tập trung, giúp code ở đây sạch hơn.

      setFormData({
        name: '',
        dueDate: '',
        estimated: '',
        priority: 'Medium',
      });
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Tạo công việc nhanh
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Điền thông tin cơ bản để bắt đầu
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Name */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <AlertCircle size={12} className="text-blue-500" />
                Tên công việc
              </label>
              <input
                autoFocus
                disabled={isLoading}
                type="text"
                placeholder="Ví dụ: Thiết kế giao diện mới..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white outline-none rounded-2xl px-5 py-4 text-slate-700 font-bold placeholder:text-slate-300 transition-all shadow-sm"
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
                  placeholder="2h, 1d..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white outline-none rounded-2xl px-5 py-4 text-slate-700 font-bold placeholder:text-slate-300 transition-all shadow-sm"
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
                className="flex-[1.5] bg-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 uppercase tracking-widest text-[12px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tạo công việc'
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
