import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Calendar,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { ProjectTask, SubTask, TaskUser } from '../types';

// --- Sub-components for Row ---

const Avatar = ({ user }: { user: TaskUser }) => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <img
      src={user.avatar}
      alt={user.name}
      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
    />
    <span className="text-[11px] text-gray-400 font-medium hidden group-hover:inline transition-all">
      {user.name}
    </span>
  </div>
);

// --- StatusSelect (Exact Look from the image) ---
const StatusSelect = ({ initialStatus }: { initialStatus: string }) => {
  const [status, setStatus] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const statusConfigs: Record<
    string,
    { label: string; bg: string; text: string; dot?: string }
  > = {
    None: {
      label: 'Không xét trạng thái',
      bg: 'bg-status-none',
      text: 'text-gray-600',
    },
    Doing: {
      label: 'Doing',
      bg: 'bg-status-doing',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
    },
    Stuck: {
      label: 'Stuck',
      bg: 'bg-status-stuck',
      text: 'text-red-700',
      dot: 'bg-red-600',
    },
    Pending: {
      label: 'Pending',
      bg: 'bg-status-pedding',
      text: 'text-orange-700',
      dot: 'bg-orange-600',
    },
    Done: {
      label: 'Done',
      bg: 'bg-status-done',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
    },
  };

  const current = statusConfigs[status] || statusConfigs['None'];

  // Calculate position when opening
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
      <div className="flex justify-center max-w-[120px]">
        {/* Trigger Button precisely as in image */}
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className={`
            w-[100px] flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm
            ${current.bg} ${current.text}
          `}
        >
          {current.dot && (
            <div className={`w-2.5 h-2.5 rounded-full ${current.dot}`} />
          )}
          <span className="truncate">
            {current.label === 'Không xét trạng thái' ? 'None' : current.label}
          </span>
        </button>
      </div>

      {/* Popover Menu via Portal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[2000]"
            onClick={() => setIsOpen(false)}
          >
            {/* Transparent click catcher to close */}
            <div className="absolute inset-0 z-0" />

            <div
              className="absolute bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 min-w-[220px] z-10 animate-in fade-in zoom-in-95 duration-200"
              style={{
                top: coords.top + 10, // Small gap from button
                left: coords.left + coords.width / 2,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popover Tail (Mũi tên trỏ lên) */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

              <div className="flex flex-col gap-1.5 relative z-20">
                {Object.entries(statusConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setStatus(key);
                      setIsOpen(false);
                    }}
                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all active:scale-95
                    ${cfg.bg} ${cfg.text} hover:brightness-95
                  `}
                  >
                    {cfg.dot ? (
                      <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot}`} />
                    ) : (
                      <div className="w-3.5 h-3.5" /> // Alignment placeholder for None
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
    <div className="flex items-center gap-1.5 opacity-80">
      <Flag size={12} className={`fill-current ${styles[priority]}`} />
      <span className="text-xs font-semibold text-gray-500 capitalize">
        {priority}
      </span>
    </div>
  );
};

// --- TaskRow Component ---
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
        className={`group border-b border-gray-50/50 hover:bg-slate-50 transition-all duration-200 ${isSubtask ? 'bg-slate-50/10' : ''}`}
      >
        {/* Checkbox & Expand Icon */}
        <td className="pl-4 py-2 w-10 relative text-center">
          {/* Vertical line connector for subtasks */}
          {isSubtask && (
            <div className="absolute left-[34px] top-0 bottom-0 w-[1.5px] bg-gray-200/50" />
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            {hasSubtasks ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-gray-400 hover:text-blue-600 transition-all duration-300 transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
              >
                <ChevronDown size={14} />
              </button>
            ) : (
              <div className="w-3.5" />
            )}
          </div>
        </td>

        {/* Task Name */}
        <td className={`py-4 ${isSubtask ? 'pl-8' : 'pl-2'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}
              className={`text-[13px] font-semibold transition-all text-left ${isSubtask ? 'text-gray-500' : 'text-gray-800'} ${task.status === 'Done' ? 'text-gray-300 line-through decoration-gray-200' : ''}`}
            >
              {task.name}
            </button>

            {/* Subtask count badge */}
            {hasSubtasks && !isExpanded && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-bold ring-1 ring-blue-100">
                <Plus size={10} />
                {task.subtasks?.length} Subtasks
              </span>
            )}
          </div>
        </td>

        {/* Assignee */}
        <td className="py-2 px-4 whitespace-nowrap text-center">
          <Avatar user={task.assignee} />
        </td>

        {/* Status (Exact Look from image) */}
        <td className="py-2 px-4 whitespace-nowrap">
          <StatusSelect initialStatus={task.status} />
        </td>

        {/* Due Date */}
        <td className="py-2 px-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar
              size={12}
              className={status === 'Done' ? 'opacity-30' : ''}
            />
            <span className="text-[11px] font-medium">{task.dueDate}</span>
          </div>
        </td>

        {/* Estimated */}
        <td className="py-2 px-4 text-[11px] text-gray-400 font-mono tracking-tighter">
          {'estimated' in task ? task.estimated : '-'}
        </td>

        {/* Priority */}
        <td className="py-2 px-4">
          <PriorityIcon priority={task.priority} />
        </td>

        {/* Labels */}
        <td className="py-2 px-4 min-w-[100px]">
          <div className="flex flex-wrap gap-1">
            {'labels' in task &&
              task.labels?.map((l) => (
                <span
                  key={l}
                  className="px-1.5 py-0.5 bg-gray-50 text-[9px] text-gray-400 rounded-sm border border-gray-100 uppercase font-bold tracking-tight"
                >
                  {l}
                </span>
              ))}
          </div>
        </td>

        {/* Today Action */}
        <td className="py-2 px-4 text-center">
          <CheckCircle2
            size={16}
            className={`mx-auto transition-all ${status === 'Done' ? 'text-emerald-500' : 'text-gray-100 hover:text-blue-400 cursor-pointer'}`}
          />
        </td>

        {/* Quick Menu */}
        <td className="pr-4 py-2 text-right">
          <button className="p-1 px-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all text-gray-300">
            <MoreHorizontal size={14} />
          </button>
        </td>
      </tr>

      {/* Recursive Render Subtasks */}
      {isExpanded &&
        hasSubtasks &&
        task.subtasks?.map((sub) => (
          <TaskRow key={sub.id} task={sub} isSubtask={true} />
        ))}
    </>
  );
};
