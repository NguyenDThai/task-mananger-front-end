import React from 'react';
import type { SubTask, ProjectTask } from '../types';
import { Avatar, PriorityIcon } from './TaskRow';
import { EstimatedPicker } from './EstimatedPicker';
import { Plus, Check, CheckCircle2 } from 'lucide-react';
import { StatusSelect } from './StatusSelect';

interface SubTaskBlockProps {
  subtasks: SubTask[];
  onSelectTask?: (task: ProjectTask) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  subtaskRefs: React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  updateTask: (args: { id: string; data: Partial<SubTask> }) => {
    unwrap: () => Promise<SubTask>;
  };
  isAddingSubtask: boolean;
  setIsAddingSubtask: (val: boolean) => void;
  subtaskName: string;
  setSubtaskName: (val: string) => void;
  handleQuickAddSubtask: (e?: React.FormEvent) => void;
}

export const SubTaskBlock: React.FC<SubTaskBlockProps> = ({
  subtasks,
  onSelectTask,
  containerRef,
  subtaskRefs,
  updateTask,
  isAddingSubtask,
  setIsAddingSubtask,
  subtaskName,
  setSubtaskName,
  handleQuickAddSubtask,
}) => {
  const hasSubtasks = !!(subtasks && subtasks.length > 0);

  return (
    <div ref={containerRef} className="flex pl-[44px] py-4 relative">
      {/* Nested Table Card Container */}
      <div className="flex-1 bg-white border border-gray-200 shadow-sm animate-in slide-in-from-top-1 duration-200 overflow-hidden">
        {hasSubtasks && (
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 border-r border-gray-100 w-[48px] min-w-[48px] max-w-[48px] text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest"></th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3">
                  Tên
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                  Phụ Trách
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[140px] min-w-[140px] max-w-[140px]">
                  Trạng Thái
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[110px] min-w-[110px] max-w-[110px]">
                  Hạn Chót
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[110px] min-w-[110px] max-w-[110px]">
                  Dự Kiến
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                  Ưu Tiên
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left w-[160px] min-w-[160px] max-w-[160px]">
                  Nhãn
                </th>
                <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[60px] min-w-[60px] max-w-[60px]">
                  Hôm Nay
                </th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[40px] min-w-[40px] max-w-[40px]"></th>
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray-100">
              {subtasks.map((sub, index) => (
                <tr
                  key={sub._id || sub.id}
                  ref={(el) => {
                    subtaskRefs.current[index] = el;
                  }}
                  className="hover:bg-gray-50 transition-colors group/sub "
                >
                  <td className="px-3 py-2 border-r border-gray-100 w-[48px] min-w-[48px] max-w-[48px] text-center relative font-mono">
                    <div
                      className={`absolute left-0 top-0 -bottom-[1px] w-[4px] transition-colors duration-300 ${
                        sub.status === 'Done'
                          ? 'bg-emerald-500'
                          : sub.status === 'None' || !sub.status
                            ? 'bg-transparent'
                            : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 border-r border-gray-100 text-[13px] text-gray-600 font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() =>
                      onSelectTask && onSelectTask(sub as ProjectTask)
                    }
                  >
                    {sub.name}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-100 text-center align-middle w-[120px] min-w-[120px] max-w-[120px]">
                    <Avatar user={sub.assignee} />
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap align-middle w-[140px] min-w-[140px] max-w-[140px]">
                    <StatusSelect
                      initialStatus={sub.status}
                      taskId={sub._id || sub.id || ''}
                    />
                  </td>
                  <td
                    className={`px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle text-[12px] font-bold tracking-tight w-[110px] min-w-[110px] max-w-[110px] ${(() => {
                      if (!sub.dueDate || sub.status === 'Done')
                        return 'text-gray-500';
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const due = new Date(sub.dueDate);
                      return due < today ? 'text-rose-500' : 'text-gray-500';
                    })()}`}
                  >
                    {sub.dueDate
                      ? new Date(sub.dueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : '-'}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[110px] min-w-[110px] max-w-[110px]">
                    <EstimatedPicker
                      value={sub.estimated || ''}
                      onUpdate={async (val: string) => {
                        try {
                          await updateTask({
                            id: sub._id || sub.id || '',
                            data: { estimated: val },
                          }).unwrap();
                        } catch (err) {
                          console.error('Failed to update estimated:', err);
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[120px] min-w-[120px] max-w-[120px]">
                    <PriorityIcon priority={sub.priority} />
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200 align-middle w-[160px] min-w-[160px] max-w-[160px]"></td>
                  <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[60px] min-w-[60px] max-w-[60px]">
                    <CheckCircle2
                      size={16}
                      className={`mx-auto ${sub.status === 'Done' ? 'text-emerald-500' : 'text-gray-100'}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-center text-gray-300 align-middle w-[40px] min-w-[40px] max-w-[40px]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer Quick Add inside block */}
        <div className="p-2.5 bg-gray-50/20 border-t border-gray-100">
          {isAddingSubtask ? (
            <form
              onSubmit={handleQuickAddSubtask}
              className="flex gap-2 items-center pl-8"
            >
              <input
                autoFocus
                value={subtaskName}
                onChange={(e) => setSubtaskName(e.target.value)}
                onBlur={() => handleQuickAddSubtask()}
                placeholder="Thêm công việc con mới..."
                className="flex-1 bg-white border-gray-200 outline-none rounded px-3 py-1.5 text-[12px] font-medium text-gray-700 focus:ring-1 focus:ring-blue-400 ring-offset-0 transition-all placeholder:text-gray-300"
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
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors pl-8"
            >
              <Plus size={14} /> Thêm công việc con...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
