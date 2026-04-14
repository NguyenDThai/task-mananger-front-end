import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import type { ProjectTask } from '../../types';
import { TaskRow } from './TaskRow';
import TaskSidebar from './TaskSidebar';
import ModalActionTasks from './ModalActionTasks';
import SummaryTask from './SummaryTask';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '../../redux/api/taskApi';
import { useGetMeQuery } from '../../redux/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { setCredentials } from '../../redux/slides/auth/authSlide';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  calculateNewPosition,
  roundPosition,
} from '../../utils/positionCalculator';

const MyTask = () => {
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, error, isFetching } = useGetTasksQuery({
    page,
    limit: 20,
  });

  const hasMore = data?.pagination?.hasMore ?? true;

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const dispatch = useDispatch();

  const tasks = useSelector((state: RootState) => state.task.tasks);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTaskRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore],
  );

  const userFromRedux = useSelector((state: RootState) => state.auth.user);
  const { data: meData } = useGetMeQuery();
  const me = meData?.user || userFromRedux;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const getId = (t: ProjectTask) => t._id || t.id;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => getId(t) === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => getId(t) === overId);

    const sortedTasks = [...tasks].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );

    let prevPos: number | null = null;
    let nextPos: number | null = null;

    if (!overTask) {
      const lastTask = sortedTasks[sortedTasks.length - 1];
      prevPos = lastTask?.position ? lastTask.position : null;
      nextPos = null;
    } else {
      const oldIndex = sortedTasks.findIndex(
        (t) => (t._id || t.id) === activeId,
      );
      const newIndex = sortedTasks.findIndex((t) => (t._id || t.id) === overId);

      const newOrderedList = [...sortedTasks];
      if (oldIndex !== -1) {
        const [movedTask] = newOrderedList.splice(oldIndex, 1);
        newOrderedList.splice(newIndex, 0, movedTask);
      } else {
        newOrderedList.splice(newIndex, 0, activeTask);
      }

      const finalIndex = newOrderedList.findIndex(
        (t) => (t._id || t.id) === activeId,
      );
      const prevTask = newOrderedList[finalIndex - 1];
      const nextTask = newOrderedList[finalIndex + 1];

      prevPos = prevTask?.position ? prevTask.position : null;
      nextPos = nextTask?.position ? nextTask.position : null;
    }

    const newPosition = roundPosition(calculateNewPosition(prevPos, nextPos));

    updateTask({
      id: activeId,
      data: {
        position: newPosition,
        prevPos: prevPos,
        nextPos: nextPos,
      },
    });
  };

  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials(meData.user));
    }
  }, [meData, dispatch]);

  const allTasksAndSubtasks = tasks.flatMap((t: ProjectTask) => [
    t,
    ...(t.subtasks || []),
  ]);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const selectedTasks = allTasksAndSubtasks.filter((t: ProjectTask) =>
    selectedTaskIds.includes(t._id || t.id || ''),
  );

  const isOwner =
    selectedTasks.length > 0 &&
    selectedTasks.every((t: ProjectTask) => {
      const creatorId =
        typeof t.createdBy === 'object' ? t.createdBy?._id : t.createdBy;
      return creatorId === (me?._id || me?.id);
    });

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

  const handleToggleSelectAll = () => {
    const allIds = getAllIds(tasks);
    if (selectedTaskIds.length === allIds.length && allIds.length > 0) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(allIds);
    }
  };

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

  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const currentSelectedTask =
    tasks.find((t: ProjectTask) => t._id === selectedTask?._id) || selectedTask;

  if (isLoading && page === 1) {
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="bg-white min-h-screen relative overflow-x-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Tổng quan không gian làm việc
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-slate-200">
                Pro
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Quản lý và theo dõi tiến độ dự án theo thời gian thực
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-all active:scale-95 font-bold text-[12px]"
            >
              <Plus size={16} />
              Thêm nhiệm vụ
            </button>
          </div>
        </div>

        <div className="p-0 pb-32">
          <div className="overflow-auto max-h-[calc(100vh-200px)] rounded-tl-lg shadow-sm no-scrollbar">
            <SortableContext
              items={tasks.map((t: ProjectTask) => (t._id || t.id) as string)}
              strategy={verticalListSortingStrategy}
            >
              <table className="w-full text-left border-separate border-spacing-0 min-w-[1300px] table-fixed">
                <thead className="bg-gray-50 shadow-gray-200/50">
                  <tr>
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-r border-b border-gray-200 w-[48px] min-w-[48px] max-w-[48px] text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest rounded-tl-lg font-mono">
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
                  {tasks.map((task: ProjectTask) => {
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
                  <tr ref={lastTaskRef}>
                    <td colSpan={10} className="text-center border-none">
                      {isFetching && (
                        <div className="flex items-center justify-center gap-2 p-4">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full font-bold"></div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Đang tải tiếp...
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </SortableContext>
          </div>

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

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}
      >
        {activeId ? (
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1300px] table-fixed opacity-80 shadow-2xl bg-white rounded-lg overflow-hidden border border-blue-200">
            <tbody>
              <TaskRow
                task={tasks.find((t) => (t._id || t.id) === activeId)!}
                canEdit={false}
              />
            </tbody>
          </table>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default MyTask;
