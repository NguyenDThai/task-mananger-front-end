import { Cloud, User } from 'lucide-react';
import type { Task } from '../types';

const KanbanUi = ({ tasks }: { tasks: Task[] }) => {
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
        <div className="flex gap-6 h-full min-w-max">
          {['To Do', 'In Progress', 'Review', 'Done'].map((column) => (
            <div
              key={column}
              className="w-80 bg-gray-100/50 rounded-3xl p-4 flex flex-col space-y-4 border border-gray-200/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                    {column}
                  </h3>
                  <span className="bg-white text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                    {
                      tasks.filter(
                        (t) =>
                          t.status ===
                          (column === 'Done' ? 'Completed' : column),
                      ).length
                    }
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  •••
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar py-2">
                {tasks
                  .filter(
                    (t) =>
                      t.status === (column === 'Done' ? 'Completed' : column),
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-5 rounded-2xl border-b-4 border-blue-500/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing"
                    >
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
                          {task.priority}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                          <User />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 leading-tight mb-4">
                        {task.title}
                      </h4>
                      {/* Số người tham gia */}
                      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                        <div className="flex items-center -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                            A
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] text-purple-600 font-bold">
                            B
                          </div>
                        </div>
                        <span className="flex items-center gap-2">
                          <Cloud />
                          <span>3</span>
                        </span>
                      </div>
                    </div>
                  ))}
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all font-bold text-sm bg-white/50 hover:bg-white">
                  + Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanUi;
