

interface SideBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SideBar = ({ activeView, setActiveView }: SideBarProps) => {
  return (
    <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col">
      <div className="p-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Satek
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-8">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">
            Menu
          </p>
          <div className="space-y-2">
            {[
              { id: "my-tasks", label: "My Tasks", icon: "🏢" },
              { id: "kanban", label: "Kanban Board", icon: "📋" },
              { id: "dashboard", label: "General View", icon: "⚡" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account User */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">
            Account
          </p>
          <button
            onClick={() => setActiveView("profile")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold ${
              activeView === "profile"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <span className="text-xl">👤</span>
            <span>Profile Settings</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
