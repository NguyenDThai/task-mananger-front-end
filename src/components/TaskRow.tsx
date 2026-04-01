import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Plus,
  Pencil,
} from 'lucide-react';
import type { ProjectTask, SubTask, TaskUser } from '../types';

// --- Sub-components for Row ---

const Avatar = ({ user }: { user?: TaskUser }) => {
  if (!user)
    return <div className="text-[10px] text-gray-300 italic">Unassigned</div>;
  return (
    <div className="flex items-center gap-2 group cursor-pointer text-center justify-center">
      <img
        src={
          user.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'U'}`
        }
        alt={user.name || 'User'}
        className="w-5.5 h-5.5 rounded-full border border-gray-100 shadow-sm hover:scale-110 transition-transform bg-blue-50"
      />
      <span className="text-[10px] text-gray-400 font-medium hidden group-hover:inline transition-all">
        {user.name || 'Unknown'}
      </span>
    </div>
  );
};

// --- StatusSelect (Small compact version for nested tables) ---
const StatusSelect = ({ initialStatus }: { initialStatus: string }) => {
  const [status, setStatus] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const statusConfigs: Record<
    string,
    { label: string; bg: string; text: string; desc: string; dot?: string }
  > = {
    Doing: {
      label: 'Doing',
      bg: 'bg-status-doing',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      desc: 'Đang triển khai',
    },
    Stuck: {
      label: 'Stuck',
      bg: 'bg-status-stuck',
      text: 'text-red-700',
      dot: 'bg-red-600',
      desc: 'Đang bị tắc nghẽn',
    },
    Pending: {
      label: 'Pending',
      bg: 'bg-status-pedding',
      text: 'text-orange-700',
      dot: 'bg-orange-600',
      desc: 'Đang tạm dừng',
    },
    Done: {
      label: 'Done',
      bg: 'bg-status-done',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
      desc: 'Đã hoàn thành',
    },
    None: {
      label: 'None',
      bg: 'bg-status-none',
      text: 'text-gray-600',
      desc: 'Chưa xét trạng thái',
    },
  };

  const current = statusConfigs[status] || statusConfigs['None'];

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className={`
            w-[85px] flex items-center justify-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-all shadow-sm active:scale-95
            ${current.bg} ${current.text}
          `}
        >
          {current.dot && (
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${current.dot}`}
            />
          )}
          <span className="truncate">
            {current.label === 'Không xét trạng thái' ? 'None' : current.label}
          </span>
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[2000]">
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-[180px] z-10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: coords.top + 6,
                left: coords.left + coords.width / 2,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45" />
              <div className="flex flex-col gap-0.5 relative z-20">
                {Object.entries(statusConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setStatus(key);
                      setIsOpen(false);
                    }}
                    className={`
                    w-full flex items-center gap-3 px-3 py-1.5 rounded text-[11px] font-bold transition-colors
                    hover:bg-gray-50 active:scale-98
                    ${cfg.bg} ${cfg.text}
                  `}
                  >
                    {cfg.dot ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    ) : (
                      <div className="w-1.5 h-1.5" />
                    )}
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    High: 'text-rose-500',
    Medium: 'text-amber-500',
    Low: 'text-emerald-500',
  };
  return (
    <div className="flex items-center gap-1 opacity-80 justify-center">
      <Flag size={10} className={`fill-current ${styles[priority]}`} />
      <span className="text-[10px] font-bold text-gray-500 capitalize">
        {priority}
      </span>
    </div>
  );
};

// --- TaskRow Component (Grid with Nested Subtask Block) ---
export const TaskRow = ({
  task,
  isSubtask = false,
}: {
  task: ProjectTask | SubTask;
  isSubtask?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtasks =
    'subtasks' in task && task.subtasks && task.subtasks.length > 0;

  return (
    <>
      <tr
        className={`group border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSubtask ? 'bg-white' : 'bg-white'}`}
      >
        {/* Main Checkbox */}
        <td className="px-3 py-2 border-r border-gray-200 w-[48px] text-center relative font-mono">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
          </div>
        </td>

        {/* Task Name and Toggle */}
        <td className="px-3 py-2 border-r border-gray-200 w-[350px]">
          <div className="flex items-center justify-between group/cell h-full pr-2">
            <div className="flex items-center gap-2">
              {hasSubtasks && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-1 rounded hover:bg-gray-100 text-gray-400 transition-all duration-300 transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                >
                  <ChevronDown size={14} />
                </button>
              )}
              {!hasSubtasks && !isSubtask && <div className="w-6" />}

              <span
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-[13px] font-bold select-none cursor-default ${isSubtask ? 'text-gray-500 font-medium' : 'text-gray-800'} ${task.status === 'Done' ? 'text-gray-300 line-through' : ''}`}
              >
                {task.name}
              </span>

              {/* Row Badges */}
              {hasSubtasks && !isExpanded && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 text-[9px] font-black border border-blue-100">
                  {task.subtasks?.length}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            {!isSubtask && (
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-4">
                <Pencil
                  size={11}
                  className="text-gray-300 hover:text-blue-500 cursor-pointer"
                />
                <Plus
                  size={13}
                  className="text-gray-300 hover:text-blue-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </td>

        {/* Standard Columns */}
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle w-[120px]">
          <Avatar user={task.assignee} />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap align-middle w-[140px]">
          <StatusSelect initialStatus={task.status} />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle text-[12px] text-gray-500 font-bold tracking-tight w-[110px]">
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })
            : '-'}
        </td>
        <td className="px-3 py-2 border-r border-gray-200 text-[11px] text-gray-400 font-mono text-center align-middle w-[90px]">
          {'estimated' in task ? task.estimated : '-'}
        </td>
        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[120px]">
          <PriorityIcon priority={task.priority} />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 align-middle w-[160px]">
          <div className="flex flex-wrap gap-1">
            {'labels' in task &&
              task.labels?.map((l) => (
                <span
                  key={l}
                  className="px-1.5 py-0.5 bg-gray-50 text-[9px] text-gray-400 rounded-sm border border-gray-100 uppercase font-black"
                >
                  {l}
                </span>
              ))}
          </div>
        </td>
        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[60px]">
          <CheckCircle2
            size={16}
            className={`mx-auto ${task.status === 'Done' ? 'text-emerald-500' : 'text-gray-100'}`}
          />
        </td>
        <td className="px-3 py-2 text-center text-gray-300 align-middle w-[40px]">
          <MoreHorizontal
            size={14}
            className="mx-auto opacity-0 group-hover:opacity-100 cursor-pointer"
          />
        </td>
      </tr>

      {/* Bản con */}
      {isExpanded && hasSubtasks && task.subtasks && (
        <tr className="bg-gray-50/20">
          <td colSpan={10} className="p-0 border-b border-gray-200 relative">
            <div className="flex pl-[44px] py-4 pr-8 relative">
              {/* Connector Line from parent */}
              <div className="absolute left-[24px] top-0 bottom-6 w-[1px] bg-gray-200" />

              {/* Nested Table Card Container */}
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in slide-in-from-top-1 duration-200">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-100 w-[48px] text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest"></th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3 w-[305px]">
                        Task name
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px]">
                        Assignee
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[140px]">
                        Status
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[110px]">
                        Due date
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[90px]">
                        Est
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px]">
                        Priority
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left w-[160px]">
                        Labels
                      </th>
                      <th className="px-3 py-2 border-r border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[60px]">
                        Done
                      </th>
                      <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {task.subtasks.map((sub) => (
                      <tr
                        key={sub._id || sub.id}
                        className="hover:bg-gray-50 transition-colors group/sub"
                      >
                        {/* 45px offset accounted for by combining indent + first column */}
                        <td className="px-3 py-2 border-r border-gray-100 w-[48px] text-center">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100 text-[13px] text-gray-600 font-medium w-[305px]">
                          {sub.name}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100 text-center align-middle w-[120px]">
                          <Avatar user={sub.assignee} />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap align-middle w-[140px]">
                          <StatusSelect initialStatus={sub.status} />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle text-[12px] text-gray-500 font-bold tracking-tight w-[110px]">
                          {sub.dueDate
                            ? new Date(sub.dueDate).toLocaleDateString(
                                'en-GB',
                                { day: '2-digit', month: 'short' },
                              )
                            : '-'}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 text-[11px] text-gray-400 font-mono text-center align-middle w-[90px]">
                          -
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[120px]">
                          <PriorityIcon priority={sub.priority} />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 align-middle w-[160px]"></td>
                        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[60px]">
                          <CheckCircle2
                            size={16}
                            className={`mx-auto ${sub.status === 'Done' ? 'text-emerald-500' : 'text-gray-100'}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-gray-300 align-middle w-[40px]"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Footer Quick Add inside block */}
                <div className="p-2.5 bg-gray-50/20 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors pl-8">
                    <Plus size={14} /> Thêm công việc con...
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
