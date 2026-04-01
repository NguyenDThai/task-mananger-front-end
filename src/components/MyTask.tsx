import { Plus } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { useGetTasksQuery } from '../redux/api/taskApi';

const MyTask = () => {
  const { data, isLoading, error } = useGetTasksQuery();
  const tasks = data?.tasks || [];

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
    <div className="bg-white min-h-screen">
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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-all active:scale-95 font-bold text-[12px]">
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse border-b border-gray-200 min-w-[1300px] table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm shadow-gray-200/50">
            <tr>
              <th className="px-3 py-2 border-r border-gray-200 min-w-[48px] w-[48px] text-center">
                <input type="checkbox" className="rounded-sm border-gray-300" />
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-3 w-[350px]">
                Task Name
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[120px]">
                Assignee
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[140px]">
                Status
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[110px]">
                Due Date
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[90px]">
                Est (H)
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[120px]">
                Priority
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left w-[160px]">
                Labels
              </th>
              <th className="px-3 py-2 border-r border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-[60px]">
                Done
              </th>
              <th className="px-3 py-2 w-[40px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <TaskRow key={task._id || task.id} task={task} />
            ))}
          </tbody>
        </table>

        {/* Footer Quick Add */}
        <div className="p-4 bg-white border-b border-gray-200">
          <button className="flex items-center gap-3 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest group">
            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
              <Plus size={14} />
            </div>
            Add task
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTask;
