import { Cloud, SquarePen, User } from 'lucide-react';
import type { ProjectTask } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useUpdateTaskMutation } from '../redux/api/taskApi';
import { DroppableColumn } from './DroppableColumn';
import { DraggableTask } from './DraggableTask';
import { updateTaskLocal } from '../redux/slides/task/taskSlide';

const KanbanUi = () => {
  const dispatch = useDispatch();

  // 1. Lấy dữ liệu từ Redux Slide (truyền thống)
  const tasks = useSelector(
    (state: RootState) => state.task.tasks as ProjectTask[],
  );

  // 2. Hook cập nhật dữ liệu (API)
  const [updateTask] = useUpdateTaskMutation();

  // 3. Cấu hình 5 cột tương ứng với 5 enum status
  // KHÔNG thêm mới status, giữ nguyên: 'None', 'Pending', 'Doing', 'Stuck', 'Done'
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

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Cập nhật local ngay lập tức trong Redux Slide
    dispatch(updateTaskLocal({ id: taskId, data: { status: newStatus } }));

    // Gọi API cập nhật dữ liệu bền vững
    updateTask({
      id: taskId,
      data: { status: newStatus },
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="h-full flex flex-col space-y-6 animate-fade-in overflow-hidden">
        {/* Header Board */}
        <div className="flex justify-between items-center px-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Project Board
            </h2>
            <p className="text-gray-500 font-medium italic">
              Kéo thả các thẻ để cập nhật tiến độ công việc.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">
            + Quick Task
          </button>
        </div>

        {/* Board content */}
        <div className="flex-1 pb-8 custom-scrollbar overflow-hidden">
          <div className="flex gap-4 h-full w-full px-2 lg:px-4">
            {columns.map((column) => {
              const filteredTasks = tasks.filter(
                (task) => task.status === column.status,
              );

              return (
                <DroppableColumn
                  id={column.status}
                  key={column.status}
                  className="flex-1 min-w-[200px] bg-gray-100/40 rounded-4xl p-4 flex flex-col border border-gray-200/50 backdrop-blur-sm"
                >
                  {/* Header Cột */}
                  <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <h3 className="font-extrabold text-gray-700 uppercase tracking-widest text-[11px]">
                        {column.title}
                      </h3>
                      <span className="bg-white text-gray-400 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-gray-100 shadow-sm">
                        {filteredTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách Task */}
                  <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar py-1">
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
                          className="group bg-white p-5 rounded-3xl shadow-sm border border-transparent hover:border-blue-200 hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span
                              className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${
                                task.priority === 'High'
                                  ? 'bg-rose-50 text-rose-500 border border-rose-100'
                                  : task.priority === 'Medium'
                                    ? 'bg-amber-50 text-amber-500 border border-amber-100'
                                    : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                              }`}
                            >
                              {task.priority || 'Low'}
                            </span>
                            <button className="text-gray-300 hover:text-gray-500 transition-colors">
                              <SquarePen size={14} />
                            </button>
                          </div>

                          <h4 className="font-bold text-gray-800 text-[14px] leading-snug mb-5 group-hover:text-blue-600 transition-colors">
                            {task.name}
                          </h4>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center -space-x-2.5">
                              <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] text-blue-500 font-bold shadow-sm">
                                {avatarContent}
                              </div>
                              {task.assignees && task.assignees.length > 1 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-purple-50 flex items-center justify-center text-[10px] text-purple-500 font-bold shadow-sm">
                                  +{task.assignees.length - 1}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                              <Cloud size={14} className="text-blue-300" />
                              <span className="text-[10px] font-bold">
                                {task.subtasks?.length || 0}
                              </span>
                            </div>
                          </div>
                        </DraggableTask>
                      );
                    })}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default KanbanUi;
