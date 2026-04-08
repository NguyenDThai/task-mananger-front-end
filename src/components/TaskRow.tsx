import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';
import {
  ChevronDown,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Plus,
  Pencil,
  Flame,
} from 'lucide-react';
import { PrioritySelect } from './PrioritySelect';
import { EstimatedPicker } from './EstimatedPicker';
import { SubTaskBlock } from './SubTaskBlock';
import {
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from '../redux/api/taskApi';
import type { ProjectTask, SubTask, TaskUser } from '../types';
import { StatusSelect } from './StatusSelect';
import branchIcon from '../assets/branch.png';
import AddingAssignee from './AddingAssignee';
import { AssigneeGroup } from './AssigneeGroup';

// --- Sub-components for Row ---

export const Avatar = ({ user }: { user?: TaskUser | string | null }) => {
  if (!user || typeof user === 'string')
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
    </div>
  );
};

// --- StatusSelect (Small compact version for nested tables) ---

export const PriorityIcon = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    Urgent: 'text-red-500',
    High: 'text-rose-500',
    Medium: 'text-amber-500',
    Low: 'text-blue-400',
  };

  const Icon = priority === 'Urgent' ? Flame : Flag;

  return (
    <div className="flex items-center gap-1 opacity-80 justify-center">
      <Icon
        size={10}
        className={`fill-current ${styles[priority] || 'text-gray-400'}`}
      />
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
  onSelectTask,
  selectedTaskIds = [],
  onToggleSelection,
}: {
  task: ProjectTask | SubTask;
  isSubtask?: boolean;
  onSelectTask?: (task: ProjectTask) => void;
  selectedTaskIds?: string[];
  onToggleSelection?: (taskId: string, childrenIds: string[]) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskName, setSubtaskName] = useState('');
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(task.name);

  // Gọi hàm từ rtk query
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Update tên task
  const handleUpdateName = async () => {
    if (!editedName.trim() || editedName === task.name) {
      setIsEditingName(false);
      setEditedName(task.name);
      return;
    }

    try {
      await updateTask({
        id: task._id,
        data: { name: editedName },
      }).unwrap();
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update task name:', err);
      setEditedName(task.name);
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(task.name);
    }
  };

  // Update ô hạn chót
  const handleUpdateDueDate = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    try {
      await updateTask({
        id: task._id,
        data: {
          dueDate: val ? new Date(val).toISOString() : undefined,
        },
      }).unwrap();
    } catch (err) {
      console.error('Failed to update deadline:', err);
    }
  };

  const subtasks = 'subtasks' in task ? task.subtasks : undefined;
  const hasSubtasks = !!(subtasks && subtasks.length > 0);

  const handleQuickAddSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subtaskName.trim()) {
      setIsAddingSubtask(false);
      return;
    }

    try {
      await createTask({
        name: subtaskName,
        parentTask: task._id,
        status: 'None',
        priority: 'Medium',
      }).unwrap();

      setSubtaskName('');
      setIsAddingSubtask(false);
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  // --- Dynamic Positioning Logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const subtaskRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [dynamicTop, setDynamicTop] = useState(36);

  // Kích hàm thay đổi kích thước khi mảng subtask thay đổi
  const updatePosition = useCallback(() => {
    if (!containerRef.current || !subtasks?.length) return;

    const targetIndex = Math.ceil(subtasks.length / 2) - 1;
    const targetRow = subtaskRefs.current[targetIndex];

    if (!targetRow) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const rowRect = targetRow.getBoundingClientRect();

    let offset: number;

    if (subtasks.length === 1) {
      // Vị trí rowRect đến top của container + 1/2 chiều cao của rowRect
      offset = rowRect.top - containerRect.top + rowRect.height / 2;
    } else {
      offset = rowRect.bottom - containerRect.top - 1;
    }

    setDynamicTop(offset);
  }, [subtasks]);

  // Update position on layout changes or expansion
  useLayoutEffect(() => {
    if (isExpanded) {
      // Sử dụng requestAnimationFrame để tránh lỗi lồng render (cascading renders)
      const frameId = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(frameId);
    }
  }, [isExpanded, updatePosition]);

  // Handle window resizing
  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [updatePosition]);

  return (
    <>
      <tr
        className={`group border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSubtask ? 'bg-white' : 'bg-white'}`}
      >
        {/* Main Checkbox */}
        <td className="px-3 py-2 border-r border-gray-200 w-[48px] min-w-[48px] max-w-[48px] text-center relative font-mono">
          {/* Status color indicator bar */}
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedTaskIds.includes(task._id)}
              onChange={() => {
                const id = task._id;
                const childrenIds = subtasks?.map((s) => s._id || s.id) || [];
                onToggleSelection?.(id, childrenIds as string[]);
              }}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
          </div>
          <div
            className={`absolute left-0 top-0 -bottom-[1px] w-[4px] z-10 transition-colors duration-300 ${(() => {
              if (!subtasks || subtasks.length === 0) return 'bg-gray-200';
              if (subtasks.every((s) => s.status === 'None'))
                return 'bg-gray-200';
              return subtasks.every((s) => s.status === 'Done')
                ? 'bg-emerald-500'
                : 'bg-amber-500';
            })()}`}
          />
        </td>

        {/* Task Name and Toggle */}
        <td className="px-3 py-2 border-r border-gray-200">
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

              {isEditingName ? (
                <input
                  autoFocus
                  className="text-[13px] border-none outline-none bg-blue-50/50 rounded px-1 py-0.5 w-full text-gray-800 font-medium"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleUpdateName}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onClick={() =>
                    !isSubtask &&
                    onSelectTask &&
                    onSelectTask(task as ProjectTask)
                  }
                  className={`text-[13px] select-none cursor-pointer hover:text-blue-600 transition-colors ${isSubtask ? 'text-gray-500 font-medium' : 'text-gray-800'} `}
                >
                  {task.name}
                </span>
              )}

              {/* Row Badges */}
              {hasSubtasks && !isExpanded && (
                <div className="flex items-center gap-1">
                  <img
                    src={branchIcon}
                    className="max-w-3 max-h-3 shrink-0"
                    alt=""
                  />
                  <span className="ml-2 px-1.5 py-0.5 text-sm font-medium text-green-500">
                    {subtasks?.length}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!isSubtask && (
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-4">
                <Pencil
                  size={11}
                  className="text-gray-300 hover:text-blue-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedName(task.name);
                    setIsEditingName(true);
                  }}
                />
                <Plus
                  size={13}
                  className="text-gray-300 hover:text-blue-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    setIsAddingSubtask(true);
                  }}
                />
              </div>
            )}
          </div>
        </td>

        {/* Standard Columns */}
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle w-[120px] min-w-[120px] max-w-[120px]">
          <div className="flex items-center gap-2 justify-center group/assignee">
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTriggerRect(rect);
                setIsAddingAssignee(true);
              }}
              className="w-7 h-7 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Plus size={14} />
            </button>
            <AssigneeGroup
              assignees={task.assignees || []}
              className="cursor-pointer"
            />
          </div>
        </td>
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap align-middle w-[140px] min-w-[140px] max-w-[140px]">
          <StatusSelect initialStatus={task.status} taskId={task._id} />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap text-center align-middle w-[110px] min-w-[110px] max-w-[110px]">
          <input
            type="date"
            className={`bg-transparent border-none outline-none text-[12px] font-bold tracking-tight w-full text-center cursor-pointer ${(() => {
              if (!task.dueDate || task.status === 'Done')
                return 'text-gray-500';
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const due = new Date(task.dueDate);
              return due < today ? 'text-rose-500' : 'text-gray-500';
            })()}`}
            value={
              task.dueDate
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : ''
            }
            onChange={handleUpdateDueDate}
          />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[110px] min-w-[110px] max-w-[110px]">
          <EstimatedPicker
            value={task.estimated || ''}
            onUpdate={async (val) => {
              try {
                await updateTask({
                  id: task._id,
                  data: { estimated: val },
                }).unwrap();
              } catch (err) {
                console.error('Failed to update estimated:', err);
              }
            }}
          />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[120px] min-w-[120px] max-w-[120px]">
          <PrioritySelect initialPriority={task.priority} taskId={task._id} />
        </td>
        <td className="px-3 py-2 border-r border-gray-200 align-middle w-[160px] min-w-[160px] max-w-[160px]">
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
        <td className="px-3 py-2 border-r border-gray-200 text-center align-middle w-[60px] min-w-[60px] max-w-[60px]">
          <CheckCircle2
            size={16}
            className={`mx-auto ${task.status === 'Done' ? 'text-emerald-500' : 'text-gray-100'}`}
          />
        </td>
        <td className="px-3 py-2 text-center text-gray-300 align-middle w-[40px] min-w-[40px] max-w-[40px]">
          <MoreHorizontal
            size={14}
            className="mx-auto opacity-0 group-hover:opacity-100 cursor-pointer"
          />
        </td>
      </tr>

      {isAddingAssignee && triggerRect && (
        <AddingAssignee
          task={task}
          onClose={() => setIsAddingAssignee(false)}
          taskId={task._id}
          triggerRect={triggerRect}
        />
      )}

      {/* Bản con */}
      {isExpanded && !isSubtask && (
        <tr className="bg-gray-50/20">
          <td colSpan={10} className="p-0 border-b border-gray-200 relative">
            {/* Main Vertical Line (aligned with dropdown icon center) */}
            <div
              className={`absolute left-[1px] top-0 bottom-0 w-[2px] transition-colors duration-300 ${(() => {
                if (!subtasks || subtasks.length === 0) return 'bg-gray-200';
                if (subtasks.every((s) => s.status === 'None'))
                  return 'bg-gray-200';
                return subtasks.every((s) => s.status === 'Done')
                  ? 'bg-emerald-500'
                  : 'bg-amber-500';
              })()}`}
            />

            {/* Horizontal Connector Line (Dynamic Position) */}
            <div
              className={`absolute left-[2px] w-[44px] h-[2px] z-10 transition-all duration-300 ${(() => {
                if (!subtasks || subtasks.length === 0) return 'bg-gray-200';
                if (subtasks.every((s) => s.status === 'None'))
                  return 'bg-gray-200';
                return subtasks.every((s) => s.status === 'Done')
                  ? 'bg-emerald-500'
                  : 'bg-amber-500';
              })()}`}
              style={{ top: `${dynamicTop}px` }}
            />

            <SubTaskBlock
              subtasks={subtasks || []}
              onSelectTask={onSelectTask}
              containerRef={containerRef}
              subtaskRefs={subtaskRefs}
              updateTask={updateTask}
              isAddingSubtask={isAddingSubtask}
              setIsAddingSubtask={setIsAddingSubtask}
              subtaskName={subtaskName}
              setSubtaskName={setSubtaskName}
              handleQuickAddSubtask={handleQuickAddSubtask}
              selectedTaskIds={selectedTaskIds}
              onToggleSelection={onToggleSelection}
            />
          </td>
        </tr>
      )}
    </>
  );
};
