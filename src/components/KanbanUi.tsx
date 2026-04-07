import { Cloud, SquarePen, User } from 'lucide-react';
import type { ProjectTask } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const KanbanUi = () => {
  const tasks = useSelector(
    (state: RootState) => state.task.tasks as ProjectTask[],
  );

  const columns = [
    { title: 'To Do', statuses: ['Pending', 'None', 'To Do'] },
    { title: 'In Progress', statuses: ['Doing', 'In Progress'] },
    { title: 'Review', statuses: ['Review', 'Stuck'] },
    { title: 'Done', statuses: ['Done', 'Completed'] },
  ];

  const today = new Date();

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Project Board</h2>
          <p className="text-gray-500">
            Track tasks through different stages of project flow.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
          + Add Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 justify-center h-full min-w-max">
          {columns.map((column) => {
            const filteredTasks = tasks.filter((task) =>
              column.statuses.includes(task.status),
            );

            return (
              <div
                key={column.title}
                className="w-80 bg-gray-100/50 rounded-3xl p-4 flex flex-col space-y-4 border border-gray-200/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                      {column.title}
                    </h3>
                    <span className="bg-white text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                      {filteredTasks.length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    •••
                  </button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar py-2">
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
                      <div
                        key={task._id || task.id}
                        className="bg-white p-5 rounded-2xl border-b-4 border-blue-500/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                      >
                        <div className="cursor-grab active:cursor-grabbing">
                          <div className="flex justify-between items-start mb-3">
                            <span
                              className={`text-[10px] uppercase font-black tracking-tighter px-2 py-0.5 rounded-md ${
                                task.priority === 'High'
                                  ? 'bg-red-50 text-red-600'
                                  : task.priority === 'Medium'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'bg-green-50 text-green-600'
                              }`}
                            >
                              {task.priority || 'Low'}
                            </span>
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                              <User size={14} />
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-800 leading-tight mb-4">
                            {task.name}
                          </h4>
                        </div>
                        {/* Subtasks or other info */}
                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                          <div className="flex items-center -space-x-2">
                            <div className="flex-1 w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                              {avatarContent}
                            </div>

                            {task.assignees && task.assignees.length > 1 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] text-purple-600 font-bold">
                                {task.assignees.length - 1}+
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] text-purple-600 font-bold">
                              <SquarePen size={15} className="cursor-pointer" />
                            </div>
                          </div>
                          <span className="flex items-center gap-1.5 font-bold">
                            <Cloud size={14} className="text-blue-400" />
                            <span>{task.subtasks?.length || 0} tasks</span>
                          </span>
                        </div>

                        {/* Date and time for task */}
                        {task.dueDate && (
                          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-gray-400 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                today > new Date(task.dueDate)
                                  ? 'bg-red-400'
                                  : 'bg-blue-400'
                              } animate-pulse`}
                            ></span>
                            {new Date(task.dueDate).toLocaleDateString(
                              'vi-VN',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanUi;
