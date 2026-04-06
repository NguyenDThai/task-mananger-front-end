import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Flag,
  Tag,
  Clock,
  Trash2,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { EstimatedPicker } from './EstimatedPicker';
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../redux/api/taskApi';
import { useGetUsersQuery } from '../redux/api/authApi';
import type { ProjectTask, TaskUser } from '../types';

interface TaskSidebarProps {
  task: ProjectTask | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ task, isOpen, onClose }) => {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: usersData } = useGetUsersQuery();

  const [name, setName] = useState(task?.name || '');
  const [status, setStatus] = useState(task?.status || 'None');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  );
  const [creatorId, setCreatorId] = useState(
    typeof task?.createdBy === 'object' && task?.createdBy !== null
      ? (task?.createdBy as TaskUser)._id || ''
      : (task?.createdBy as string) || '',
  );
  const [estimated, setEstimated] = useState(task?.estimated || '');

  const handleUpdate = async (fields: Partial<ProjectTask>) => {
    if (!task) return;
    try {
      await updateTask({
        id: task._id || task.id || '',
        data: fields,
      }).unwrap();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Bạn có chắc chắn muốn xóa công việc này?'))
      return;
    try {
      await deleteTask(task._id || task.id || '').unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (!task) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-100 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-101 transform transition-transform duration-300 ease-out border-l border-gray-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleUpdate({ status: status === 'Done' ? 'None' : 'Done' })
              }
              className={`p-1.5 rounded-md border transition-colors ${
                status === 'Done'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-emerald-500 hover:border-emerald-200'
              }`}
            >
              <CheckCircle size={18} />
            </button>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Task Details
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 flex flex-col gap-8">
          {/* Title Area */}
          <div className="flex flex-col gap-2">
            <textarea
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleUpdate({ name })}
              className="text-2xl font-bold text-gray-900 border-none p-0 focus:ring-0 resize-none w-full placeholder:text-gray-300 outline-none"
              placeholder="Task name..."
              rows={2}
            />

            {/* Properties Grid - Editable for everyone (Parent and Child) */}
            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
              {/* Assignee */}
              <div className="flex items-center group">
                <div className="w-32 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <User size={16} />
                  <span>Người Tạo</span>
                </div>
                <div className="flex-1">
                  <select
                    value={creatorId}
                    onChange={(e) => {
                      setCreatorId(e.target.value);
                      handleUpdate({ createdBy: e.target.value });
                    }}
                    className="w-full bg-transparent border-none text-sm text-gray-700 focus:ring-0 font-bold p-0 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {usersData?.users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <div className="w-32 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Clock size={16} />
                  <span>Trạng Thái</span>
                </div>
                <div className="flex-1">
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      handleUpdate({ status: e.target.value });
                    }}
                    className="w-full bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0 cursor-pointer outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Doing">Doing</option>
                    <option value="Stuck">Stuck</option>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center">
                <div className="w-32 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Calendar size={16} />
                  <span>Hạn Chót</span>
                </div>
                <div className="flex-1 px-1">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      handleUpdate({ dueDate: e.target.value });
                    }}
                    className="w-full bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0 cursor-pointer outline-none"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center">
                <div className="w-32 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Flag size={16} />
                  <span>Ưu Tiên</span>
                </div>
                <div className="flex-1 text-center">
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      handleUpdate({ priority: e.target.value });
                    }}
                    className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 p-0 text-gray-700 cursor-pointer outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Estimated with Reusable Picker */}
              <div className="flex items-center">
                <div className="w-32 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Clock size={16} />
                  <span>Dự Kiến</span>
                </div>
                <div className="flex-1">
                  <EstimatedPicker
                    value={estimated}
                    variant="sidebar"
                    onUpdate={(val) => {
                      setEstimated(val);
                      handleUpdate({ estimated: val });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* --- Section: Subtasks / Checklist --- */}
          <div className="px-8 py-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <CheckCircle size={12} />
                <span>
                  {task.parentTask
                    ? 'Checklist Công Việc'
                    : 'Danh Sách Công Việc Con'}
                </span>
              </div>
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded">
                  {task.subtasks.filter((s) => s.status === 'Done').length}/
                  {task.subtasks.length}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {task.subtasks?.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={sub.status === 'Done'}
                    readOnly
                    className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span
                    className={`text-[13px] transition-colors ${sub.status === 'Done' ? 'text-gray-300 line-through italic' : 'text-gray-700 font-medium'}`}
                  >
                    {sub.name}
                  </span>
                </div>
              ))}

              {/* Quick Add Interface */}
              <div className="group flex items-center gap-3 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-2.5 focus-within:border-blue-400 focus-within:bg-white transition-all cursor-text mt-2">
                <Plus size={14} className="text-gray-300" />
                <input
                  type="text"
                  placeholder={
                    task.parentTask
                      ? 'Thêm mục checklist...'
                      : 'Thêm công việc con mới...'
                  }
                  className="flex-1 bg-transparent border-none outline-none text-[12px] placeholder:text-gray-300 font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Labels Area */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
              <Tag size={12} />
              Nhãn
            </div>
            <div className="flex flex-wrap gap-2">
              {task.labels?.map((l) => (
                <span
                  key={l}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100"
                >
                  {l}
                </span>
              ))}
              <button className="px-2.5 py-1 border border-dashed border-gray-300 text-gray-400 rounded text-[10px] font-bold hover:border-blue-400 hover:text-blue-500 transition-colors">
                + Add Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskSidebar;
