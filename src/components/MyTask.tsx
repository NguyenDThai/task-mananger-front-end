import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ProjectTask } from '../types';
import { TaskRow } from './TaskRow';

const MyTask = () => {
  // Mock Data
  const [mockTasks] = useState<ProjectTask[]>([
    {
      id: '1',
      name: 'Thiết kế hệ thống Design System v4.0',
      assignee: {
        name: 'Thái',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thai',
      },
      status: 'In Progress',
      dueDate: '20 May',
      estimated: '24h',
      priority: 'High',
      labels: ['Design', 'Core'],
      subtasks: [
        {
          id: '1-1',
          name: 'Phác thảo bảng màu (Palette) và Font Family',
          assignee: {
            name: 'An',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An',
          },
          status: 'Done',
          dueDate: '12 May',
          priority: 'Medium',
        },
        {
          id: '1-2',
          name: 'Tạo bộ Button Component động',
          assignee: {
            name: 'Thái',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thai',
          },
          status: 'Pending',
          dueDate: '15 May',
          priority: 'Low',
        },
      ],
    },
    {
      id: '2',
      name: 'Tích hợp API thanh toán Stripe Checkout',
      assignee: {
        name: 'Linh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh',
      },
      status: 'Pending',
      dueDate: '25 May',
      estimated: '40h',
      priority: 'High',
      labels: ['Dev', 'Finance'],
    },
    {
      id: '3',
      name: 'Tối ưu hiệu năng ứng dụng (Performance)',
      assignee: {
        name: 'Thái',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thai',
      },
      status: 'In Progress',
      dueDate: '30 May',
      estimated: '12h',
      priority: 'Medium',
      labels: ['Infra'],
      subtasks: [
        {
          id: '3-1',
          name: 'Audit Lighthouse cho trang Home',
          assignee: {
            name: 'Hoàng',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
          },
          status: 'Pending',
          dueDate: '28 May',
          priority: 'Low',
        },
      ],
    },
  ]);

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
            {mockTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>

        {/* Footer Quick Add */}
        <div className="p-4 bg-white border-b border-gray-200">
          <button className="flex items-center gap-3 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest group">
            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
              <Plus size={14} />
            </div>
            Quick Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTask;
