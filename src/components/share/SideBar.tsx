import {
  CircleUserRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Zap,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../redux/api/authApi';
import { logout as logoutAction } from '../../redux/slides/auth/authSlide';
import { toast } from 'react-toastify';

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const location = useLocation();

  const getActiveView = (pathName: string) => {
    switch (pathName) {
      case '/kanban':
        return 'kanban';
      case '/dashboard':
        return 'dashboard';
      case '/profile':
        return 'profile';
      default:
        return 'my-tasks';
    }
  };

  const activeView = getActiveView(location.pathname);

  const handleNavClick = (viewId: string) => {
    const paths: Record<string, string> = {
      'my-tasks': '/',
      kanban: '/kanban',
      dashboard: '/dashboard',
      profile: '/profile',
    };
    navigate(paths[viewId] || '/');
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction());
      toast.success('Bạn đã đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              { id: 'my-tasks', label: 'My Tasks', icon: <Landmark /> },
              {
                id: 'kanban',
                label: 'Kanban Board',
                icon: <LayoutDashboard />,
              },
              { id: 'dashboard', label: 'General View', icon: <Zap /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
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
          <div className="space-y-2">
            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold ${
                activeView === 'profile'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">
                <CircleUserRound />
              </span>
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold text-red-400 hover:bg-red-50 hover:text-red-600 group"
            >
              <LogOut
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
