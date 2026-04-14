import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SideBar } from '../../components';
import { Bell, Search } from 'lucide-react';
import type { RootState } from '../../redux/store';

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 px-10 flex items-center justify-between z-10">
          <div className="relative w-1/3 group">
            <input
              type="text"
              placeholder="Search resources, tasks..."
              className="w-full bg-white px-12 py-4 rounded-3xl border border-gray-100 shadow-sm focus:shadow-xl focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-semibold"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Search />
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="w-12 h-12 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xl hover:scale-110 transition-transform">
              <Bell />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover group-hover:rotate-6 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black group-hover:rotate-6 transition-transform">
                  {user?.name?.[0].toUpperCase() || 'A'}
                </div>
              )}
              <div>
                <p className="text-xs font-black text-gray-800">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] font-bold text-gray-400">
                  {user?.email || 'Email'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 has-[.hidden-y]:overflow-y-hidden has-[.hidden-y]:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Home;
