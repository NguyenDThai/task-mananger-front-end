import { useState } from 'react';
import { Cloud, SquarePen, User, Calendar, Plus } from 'lucide-react';
import type { ProjectTask } from '../../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { DroppableColumn } from './DroppableColumn';
import { DraggableTask } from './DraggableTask';
import { QuickTaskModal } from './QuickTaskModal';
import { EditTaskModal } from './EditTaskModal';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const KanbanUi = () => {
  // 1. Lấy dữ liệu từ Redux Slide (truyền thống)
  const tasks = useSelector(
    (state: RootState) => state.task.tasks as ProjectTask[],
  );

  // 2. Hook cập nhật dữ liệu (API)
  const [updateTask] = useUpdateTaskMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);

  // 3. Cấu hình 5 cột tương ứng với 5 enum status
  const columns = [
    { title: 'Backlog', status: 'None' },
    { title: 'To Do', status: 'Pending' },
    { title: 'In Progress', status: 'Doing' },
    { title: 'Review', status: 'Stuck' },
    { title: 'Done', status: 'Done' },
  ];

  // Cấu hình sensor để tránh xung đột với click sự kiện khác
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Chỉ bắt đầu kéo sau khi di chuyển 8px
      },
    }),
  );

  // 4. Xử lý khi kết thúc kéo thả
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const getId = (t: ProjectTask) => t._id || t.id;
    // Task đang kéo
    const activeId = active.id as string;
    // Column
    const overId = over.id as string;

    // Tìm task đang kéo
    const activeTask = tasks.find((t) => getId(t) === activeId);
    if (!activeTask) return;

    // Xác định task đích
    const overTask = tasks.find((t) => getId(t) === overId);

    // Xác định column đích
    const newStatus = overTask ? overTask.status : overId;

    // Lấy danh sách task trong column đích
    const columnTasks = tasks
      .filter((t) => t.status === newStatus && getId(t) !== activeId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Nếu thả vào vùng trống thì xuống dưới
    if (!overTask) {
      const last = columnTasks[columnTasks.length - 1];
      const newPosition = last ? (last.position || 0) + 1 : 1;

      updateTask({
        id: activeId,
        data: { status: newStatus, position: newPosition },
      });
      return;
    }

    // Tìm index của task bị hover
    const overIndex = columnTasks.findIndex(
      (t) => getId(t) === getId(overTask),
    );
    if (overIndex === -1) return;

    // Lấy prev/next
    const prev = columnTasks[overIndex - 1];

    const next = columnTasks[overIndex + 1];

    const isSameColumn = activeTask.status === newStatus;

    const isMovingDown =
      isSameColumn && (activeTask.position || 0) < (overTask.position || 0);

    let newPosition: number;
    // Tính vị trí
    if (isMovingDown) {
      newPosition = next
        ? ((overTask.position || 0) + (next.position || 0)) / 2
        : (overTask.position || 0) + 1;
    } else {
      newPosition = prev
        ? ((prev.position || 0) + (overTask.position || 0)) / 2
        : (overTask.position || 0) - 1;
    }

    updateTask({
      id: activeId,
      data: {
        status: newStatus,
        position: newPosition,
      },
    });
  };

  const today = new Date();

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-fade-in overflow-hidden">
          {/* Header Board - Responsive Layout */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Project Board
              </h2>
              <p className="text-gray-500 text-xs md:text-sm font-medium italic">
                Kéo thả các thẻ để cập nhật tiến độ công việc.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 md:px-7 py-2.5 md:py-3 rounded-[1.25rem] font-black text-[12px] md:text-[13px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 group"
            >
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              Quick Task
            </button>
          </div>

          {/* Board content - Horizontal Scroll on Mobile */}
          <div className="flex-1 pb-4 md:pb-8 overflow-hidden">
            <div className="flex gap-4 h-full w-full px-4 md:px-6 overflow-x-auto custom-scrollbar pb-4 snap-x">
              {columns.map((column) => {
                const filteredTasks = tasks
                  .filter((task) => task.status === column.status)
                  .sort((a, b) => (a.position || 0) - (b.position || 0));

                return (
                  <DroppableColumn
                    id={column.status}
                    key={column.status}
                    className="flex-1 min-w-[280px] max-w-[350px] md:min-w-[300px] h-full bg-gray-100/40 rounded-[2.5rem] p-3 md:p-4 flex flex-col border border-gray-200/50 backdrop-blur-sm snap-center"
                  >
                    {/* Header Cột */}
                    <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <h3 className="font-extrabold text-gray-700 uppercase tracking-widest text-[10px] md:text-[11px]">
                          {column.title}
                        </h3>
                        <span className="bg-white text-gray-400 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-gray-100 shadow-sm">
                          {filteredTasks.length}
                        </span>
                      </div>
                    </div>

                    {/* Danh sách Task - Vertical Scroll inner column */}
                    <SortableContext
                      items={filteredTasks.map(
                        (t) => (t._id || t.id) as string,
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto no-scrollbar py-1">
                        {filteredTasks.map((task) => {
                          const firstAssignee = task.assignees?.[0];
                          const avatarContent = firstAssignee ? (
                            typeof firstAssignee === 'string' ? (
                              firstAssignee.charAt(0).toUpperCase()
                            ) : (
                              firstAssignee.name.charAt(0).toUpperCase()
                            )
                          ) : (
                            <User size={12} />
                          );

                          return (
                            <DraggableTask
                              key={task._id || task.id}
                              id={(task._id || task.id) as string}
                              className="group bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-transparent hover:border-blue-200 hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex justify-between items-start mb-3 md:mb-4">
                                <span
                                  className={`text-[8px] md:text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${
                                    task.priority === 'High'
                                      ? 'bg-rose-50 text-rose-500 border border-rose-100'
                                      : task.priority === 'Medium'
                                        ? 'bg-amber-50 text-amber-500 border border-amber-100'
                                        : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                  }`}
                                >
                                  {task.priority || 'Low'}
                                </span>
                                <button
                                  onClick={() => {
                                    setTaskToEdit(task);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                  <SquarePen size={14} />
                                </button>
                              </div>

                              <h4 className="font-bold text-gray-800 text-[13px] md:text-[14px] leading-snug mb-4 md:mb-5 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {task.name}
                              </h4>

                              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-50">
                                <div className="flex items-center -space-x-2">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[9px] md:text-[10px] text-blue-500 font-bold shadow-sm">
                                    {avatarContent}
                                  </div>
                                  {task.assignees &&
                                    task.assignees.length > 1 && (
                                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-purple-50 flex items-center justify-center text-[9px] md:text-[10px] text-purple-500 font-bold shadow-sm">
                                        +{task.assignees.length - 1}
                                      </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                                  <Cloud size={12} className="text-blue-300" />
                                  <span className="text-[9px] md:text-[10px] font-bold">
                                    {task.subtasks?.length || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Hiển thị ngày hạn chót */}
                              {task.dueDate && (
                                <div
                                  className={`mt-3 md:mt-4 flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold ${
                                    today > new Date(task.dueDate)
                                      ? 'text-red-500'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  <Calendar size={12} strokeWidth={2.5} />
                                  <span>
                                    {new Date(task.dueDate).toLocaleDateString(
                                      'vi-VN',
                                      {
                                        day: '2-digit',
                                        month: '2-digit',
                                      },
                                    )}
                                  </span>
                                </div>
                              )}
                            </DraggableTask>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>
      <QuickTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {taskToEdit && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          task={taskToEdit}
          key={taskToEdit._id}
        />
      )}
    </>
  );
};

export default KanbanUi;
