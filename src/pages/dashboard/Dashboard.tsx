import { useGetTaskStatsQuery } from '../../redux/api/taskApi';
import { LayoutDashboard, CheckCircle2, CircleDot, Clock } from 'lucide-react';

const Dashboard = () => {
  // Lấy dữ liệu từ API thống kê mới tạo
  const { data: stats, isLoading, isError } = useGetTaskStatsQuery();

  if (isLoading)
    return (
      <div className="p-8 animate-pulse text-gray-500">
        Đang phân tích dữ liệu ứng dụng...
      </div>
    );
  if (isError)
    return <div className="p-8 text-red-500">Không thể tải thống kê.</div>;

  // Cấu hình các thẻ hiển thị
  const statCards = [
    {
      label: 'Tổng công việc',
      value: stats?.total || 0,
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
    },
    {
      label: 'Đang thực hiện',
      value: (stats?.['Doing'] || 0) + (stats?.['In Progress'] || 0),
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-orange-200',
    },
    {
      label: 'Đã hoàn thành',
      value: stats?.['Done'] || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
    },
    {
      label: 'Chưa bắt đầu',
      value: stats?.['None'] || 0,
      icon: CircleDot,
      color: 'from-slate-500 to-slate-700',
      shadow: 'shadow-slate-200',
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          HỆ THỐNG QUẢN TRỊ
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Dưới đây là tổng quan tình hình công việc trong hệ thống của bạn
        </p>
      </header>

      {/* Grid hiển thị các thẻ Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-white rounded-3xl p-6 shadow-xl ${card.shadow} transition-all hover:-translate-y-1 hover:shadow-2xl group`}
          >
            {/* Background trang trí ẩn bên dưới */}
            <div
              className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}
            ></div>

            <div className="flex flex-col gap-4">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
              >
                <card.icon size={24} />
              </div>

              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                  {card.label}
                </p>
                <h3 className="text-4xl font-black text-slate-800 tabular-nums">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Thanh tiến độ nhỏ dưới cùng (nếu muốn) */}
            <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${card.color}`}
                style={{
                  width: stats?.total
                    ? `${(card.value / stats.total) * 100}%`
                    : '0%',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
