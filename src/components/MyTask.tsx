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
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-1000">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Project Master
            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-widest font-bold">
              Workspace
            </span>
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Nơi tập trung tất cả các workflow quan trọng của team
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-slate-500 font-bold text-[13px] hover:text-slate-900 transition-all">
            Xuất Excel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 font-bold text-[13px]">
            <Plus size={18} />
            Thêm Công Việc
          </button>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-4 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded-md border-gray-300"
                  />
                </th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-6">
                  Công Việc
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Phụ Trách
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Trạng Thái
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Hạn Chót
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Dự Kiến (H)
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Cấp Độ
                </th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Nhãn
                </th>
                <th className="py-4 px-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Check
                </th>
                <th className="pr-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Quick Add */}
        <div className="p-6 bg-slate-50/30 flex justify-center rounded-b-[2rem]">
          <button className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-blue-500 transition-all uppercase tracking-widest group">
            <div className="p-1 rounded-full group-hover:bg-blue-100 transition-colors">
              <Plus size={16} />
            </div>
            Thêm dòng công việc mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTask;
