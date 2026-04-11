import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import type { ProjectTask } from '../../types';
import { TaskRow } from './TaskRow';
import TaskSidebar from './TaskSidebar';
import ModalActionTasks from './ModalActionTasks';
import SummaryTask from './SummaryTask';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
} from '../../redux/api/taskApi';
import { useGetMeQuery } from '../../redux/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { setCredentials } from '../../redux/slides/auth/authSlide';

const MyTask = () => {
  const { isLoading, error } = useGetTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const dispatch = useDispatch();

  // Luôn sử dụng dữ liệu từ Redux Slide làm nguồn chính
  const tasks = useSelector((state: RootState) => state.task.tasks);

  // fall back user
  const userFromRedux = useSelector((state: RootState) => state.auth.user);

  const { data: meData } = useGetMeQuery();
  const me = meData?.user || userFromRedux;

  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials(meData.user));
    }
  }, [meData, dispatch]);

  // Calculate global summary info
  const allTasksAndSubtasks = tasks.flatMap((t: ProjectTask) => [
    t,
    ...(t.subtasks || []),
  ]);

  // Calculate selection ownership
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const selectedTasks = allTasksAndSubtasks.filter((t: ProjectTask) =>
    selectedTaskIds.includes(t._id || t.id || ''),
  );

  // Kiểm tra xem người dùng có phải là chủ sở hữu của tất cả các task được chọn không
  const isOwner =
    selectedTasks.length > 0 &&
    selectedTasks.every((t: ProjectTask) => {
      const creatorId =
        typeof t.createdBy === 'object' ? t.createdBy?._id : t.createdBy;
      return creatorId === (me?._id || me?.id);
    });

  // Tổng số task
  const totalTasksCount = allTasksAndSubtasks.length;
  const completedTasksCount = allTasksAndSubtasks.filter(
    (t: ProjectTask) => t.status === 'Done',
  ).length;
  const doingTasksCount = allTasksAndSubtasks.filter(
    (t: ProjectTask) => t.status === 'Doing' || t.status === 'In Progress',
  ).length;
  const todoTasksCount =
    totalTasksCount - (completedTasksCount + doingTasksCount);

  const globalDoneRatio =
    totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
  const globalDoingRatio =
    totalTasksCount > 0 ? (doingTasksCount / totalTasksCount) * 100 : 0;
  const globalTodoRatio =
    totalTasksCount > 0 ? (todoTasksCount / totalTasksCount) * 100 : 0;

  const validDates = allTasksAndSubtasks
    .map((t: ProjectTask) => (t.dueDate ? new Date(t.dueDate) : null))
    .filter((d: Date | null): d is Date => d !== null);

  let globalDateRangeText = '-';
  if (validDates.length > 0) {
    const minDate = new Date(
      Math.min(...validDates.map((d: Date) => d.getTime())),
    );
    const maxDate = new Date(
      Math.max(...validDates.map((d: Date) => d.getTime())),
    );
    const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    globalDateRangeText = `${fmt(minDate)} - ${fmt(maxDate)}`;
  }

  // Lấy tất cả ID của task và subtask
  const getAllIds = (taskList: ProjectTask[]): string[] => {
    let ids: string[] = [];
    taskList.forEach((task) => {
      const id = task._id || task.id;
      if (id) {
        ids.push(id);
        if (task.subtasks && task.subtasks.length > 0) {
          ids = [...ids, ...getAllIds(task.subtasks as ProjectTask[])];
        }
      }
    });
    return ids;
  };

  // Chọn tất cả task
  const handleToggleSelectAll = () => {
    const allIds = getAllIds(tasks);
    // Nếu đã chon hết thì bỏ chọn
    if (selectedTaskIds.length === allIds.length && allIds.length > 0) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(allIds);
    }
  };

  // Chọn task
  const handleToggleTask = (taskId: string, childrenIds: string[] = []) => {
    setSelectedTaskIds((prev) => {
      const isSelected = prev.includes(taskId);
      const allTargetIds = [taskId, ...childrenIds];

      if (isSelected) {
        return prev.filter((id) => !allTargetIds.includes(id));
      } else {
        const newIds = [...prev];
        allTargetIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      }
    });
  };

  // Sidebar state
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quick Add state
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState('');

  // Mở sidebar
  const handleOpenSidebar = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsSidebarOpen(true);
  };

  // Thêm task cha
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

  // Lấy task để hiển thị sidebar
  const currentSelectedTask =
    tasks.find((t: ProjectTask) => t._id === selectedTask?._id) || selectedTask;

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

  // Định nghĩa thứ tự trạng thái giống như bên Kanban để đồng nhất việc sắp xếp
  const statusOrder = ['None', 'Pending', 'Doing', 'Stuck', 'Done'];

  // Sắp xếp tasks: ưu tiên theo trạng thái, sau đó mới đến position
  const sortedTasks = [...tasks].sort((a, b) => {
    const aStatusIndex = statusOrder.indexOf(a.status);
    const bStatusIndex = statusOrder.indexOf(b.status);

    if (aStatusIndex !== bStatusIndex) {
      return aStatusIndex - bStatusIndex;
    }
    return (a.position || 0) - (b.position || 0);
  });

  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden">
      {/* Minimalistic Header */}
      <div className="flex items-center justify-between px-6 py-5  border-gray-200">
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
      <div className="p-0 pb-32">
        <div className="overflow-auto max-h-[calc(100vh-200px)] rounded-tl-lg shadow-sm">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1300px] table-fixed">
            <thead className="bg-gray-50 shadow-gray-200/50">
              <tr>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 w-[48px] min-w-[48px] max-w-[48px] text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest rounded-tl-lg">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={
                        tasks.length > 0 &&
                        selectedTaskIds.length === getAllIds(tasks).length
                      }
                      onChange={handleToggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="absolute left-0 top-0 -bottom-px w-[4px] z-10 transition-colors duration-300 bg-gray-200"></div>
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3">
                  Tên
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                  Phụ Trách
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[140px] min-w-[140px] max-w-[140px]">
                  Trạng Thái
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[110px] min-w-[110px] max-w-[110px]">
                  Hạn Chót
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[110px] min-w-[110px] max-w-[110px]">
                  Dự Kiến
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[120px] min-w-[120px] max-w-[120px]">
                  Ưu Tiên
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left w-[160px] min-w-[160px] max-w-[160px]">
                  Nhãn
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[60px] min-w-[60px] max-w-[60px]">
                  Hôm Nay
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[40px] min-w-[40px] max-w-[40px] rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTasks.map((task: ProjectTask) => {
                const creatorId =
                  typeof task.createdBy === 'string'
                    ? task.createdBy
                    : task.createdBy?._id;

                const isOwnerOfThisTask = creatorId === (me?._id || me?.id);

                return (
                  <TaskRow
                    key={task._id || task.id}
                    task={task}
                    onSelectTask={handleOpenSidebar}
                    selectedTaskIds={selectedTaskIds}
                    onToggleSelection={handleToggleTask}
                    canEdit={!!isOwnerOfThisTask}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Thêm nhanh công việc */}
        <div className="relative p-4 bg-white border-b border-gray-200 rounded-bl-lg overflow-hidden">
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
              className="flex items-center gap-3 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-all tracking-widest group cursor-text"
            >
              Thêm công việc
            </button>
          )}
          <div className="absolute left-0 top-0 -bottom-px w-[4px] z-10 transition-colors duration-300 bg-gray-200"></div>
        </div>

        <SummaryTask
          globalTodoRatio={globalTodoRatio}
          globalDoingRatio={globalDoingRatio}
          globalDoneRatio={globalDoneRatio}
          globalDateRangeText={globalDateRangeText}
        />
      </div>

      <TaskSidebar
        key={currentSelectedTask?._id || currentSelectedTask?.id || 'none'}
        task={currentSelectedTask}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {selectedTaskIds.length > 0 && (
        <ModalActionTasks
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};

export default MyTask;
