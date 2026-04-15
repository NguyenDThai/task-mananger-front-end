import {
  CircleUserRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../redux/api/authApi';
import { logout as logoutAction } from '../../redux/slides/auth/authSlide';
import { toast } from 'react-toastify';

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <aside
      className={`bg-white border-r border-gray-100 hidden lg:flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className="px-7 py-10 flex justify-start">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform flex-shrink-0">
            <span className="text-white font-black text-xl">S</span>
          </div>
          {!isCollapsed && (
            <h1
              className={`
              text-3xl font-black tracking-tighter bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent whitespace-nowrap
              ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}
            `}
            >
              Satek
            </h1>
          )}
        </div>
      </div>

      <nav className="flex-1 px-5 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6 px-4">
            {!isCollapsed && (
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Menu
              </p>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>
          <div className="space-y-2">
            {[
              {
                id: 'my-tasks',
                label: 'Công việc của bạn',
                icon: <Landmark />,
              },
              {
                id: 'kanban',
                label: 'Kanban Board',
                icon: <LayoutDashboard />,
              },
              { id: 'dashboard', label: 'Thống kê', icon: <Zap /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group w-full h-14 flex items-center justify-start space-x-4 px-2 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={item.label}
              >
                <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-xl">
                  {item.icon}
                </span>
                <div
                  className={`
                    flex items-center overflow-hidden transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100'}
                  `}
                >
                  <span className="whitespace-nowrap font-bold">
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Account User */}
        <div>
          {!isCollapsed && (
            <p
              className={`
              text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4 whitespace-nowrap
              ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}
            `}
            >
              Tài khoản
            </p>
          )}
          <div className="space-y-2">
            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold ${
                activeView === 'profile'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? 'Cài đặt tài khoản' : ''}
            >
              <span className="text-xl flex-shrink-0">
                <CircleUserRound />
              </span>
              {!isCollapsed && (
                <div
                  className={`
                  flex items-center overflow-hidden transition-all duration-300 ease-in-out
                  ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100'}
                `}
                >
                  <span className="whitespace-nowrap font-bold">
                    Cài đặt tài khoản
                  </span>
                </div>
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 font-bold text-red-400 hover:bg-red-50 hover:text-red-600 group ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Đăng xuất' : ''}
            >
              <LogOut className="group-hover:rotate-12 transition-transform flex-shrink-0" />
              {!isCollapsed && (
                <div
                  className={`
                  flex items-center overflow-hidden transition-all duration-300 ease-in-out
                  ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100'}
                `}
                >
                  <span className="whitespace-nowrap font-bold">Đăng xuất</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default SideBar;
