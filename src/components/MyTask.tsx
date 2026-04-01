import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { useGetTasksQuery, useCreateTaskMutation } from '../redux/api/taskApi';
import TaskSidebar from './TaskSidebar';
import type { ProjectTask } from '../types';

const MyTask = () => {
  const { data, isLoading, error } = useGetTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const tasks = data?.tasks || [];

  // Sidebar state
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quick Add state
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState('');

  const handleOpenSidebar = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsSidebarOpen(true);
  };

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskName.trim()) {
      setIsAdding(false);
      return;
    }

    try {
      await createTask({ name: taskName }).unwrap();
      setTaskName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Close sidebar if task is deleted or data changes?
  // Actually rtk query handles updates fine.
  // We need to keep selectedTask synced if it's updated.
  const currentSelectedTask =
    tasks.find((t) => t._id === selectedTask?._id) || selectedTask;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 gap-4">
        <p className="font-bold">Đã có lỗi xảy ra khi tải dữ liệu!</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-100 rounded-md"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden">
      {/* Minimalistic Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Workspace Dashboard
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-slate-200">
              Pro
            </span>
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Quản lý và theo dõi tiến độ dự án theo thời gian thực
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-500 font-bold text-[12px] hover:text-gray-900 transition-all">
            Export Excel
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-all active:scale-95 font-bold text-[12px]"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto p-0 pb-32">
        <table className="w-full text-left border-collapse border-b border-gray-200 min-w-[1300px] table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm shadow-gray-200/50">
            <tr>
              <th className="px-3 py-2 border-r border-gray-200 w-[48px] min-w-[48px] max-w-[48px] text-center">
                <input type="checkbox" className="rounded-sm border-gray-300" />
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-3">
                Tên
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                Phụ Trách
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[140px] min-w-[140px] max-w-[140px]">
                Trạng Thái
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[110px] min-w-[110px] max-w-[110px]">
                Hạn Chót
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[80px] min-w-[80px] max-w-[80px]">
                Dự Kiến
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                Ưu Tiên
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left w-[160px] min-w-[160px] max-w-[160px]">
                Nhãn
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[60px] min-w-[60px] max-w-[60px]">
                Hôm nay
              </th>
              <th className="px-3 py-2 w-[40px] min-w-[40px] max-w-[40px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <TaskRow
                key={task._id || task.id}
                task={task}
                onSelectTask={handleOpenSidebar}
              />
            ))}
          </tbody>
        </table>

        {/* Footer Quick Add */}
        <div className="p-4 bg-white border-b border-gray-200">
          {isAdding ? (
            <form
              onSubmit={handleQuickAdd}
              className="flex gap-2 items-center pl-8"
            >
              <input
                autoFocus
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onBlur={() => handleQuickAdd()}
                placeholder="What needs to be done?"
                className="flex-1 bg-blue-50/50 border-none outline-none rounded px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:ring-1 focus:ring-blue-400 ring-offset-0 transition-all placeholder:text-gray-300"
              />
              <button
                type="submit"
                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Check size={14} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-3 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest group cursor-pointer"
            >
              Add task
            </button>
          )}
        </div>
      </div>

      <TaskSidebar
        key={currentSelectedTask?._id || currentSelectedTask?.id || 'none'}
        task={currentSelectedTask}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default MyTask;
