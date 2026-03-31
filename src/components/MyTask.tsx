import type { Task } from "../types";

const MyTask = ({
  tasks,
  taskFilter,
  setTaskFilter,
}: {
  tasks: Task[];
  taskFilter: string;
  setTaskFilter: (filter: string) => void;
}) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-500">
          Manage and track your individual workload.
        </p>
      </div>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {["all", "To Do", "In Progress", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setTaskFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              taskFilter === f
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Task Name
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Priority
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Category
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-6 py-4 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tasks
            .filter((t) => taskFilter === "all" || t.status === taskFilter)
            .map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50/80 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "Medium"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-500 font-medium">
                  {task.category}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${
                        task.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : task.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                            : "bg-gray-50 text-gray-700 ring-gray-600/20"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-gray-300 hover:text-blue-600 transition-colors text-xl font-bold">
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MyTask;
