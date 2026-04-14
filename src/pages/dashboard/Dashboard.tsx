import { useGetTaskStatsQuery } from '../../redux/api/taskApi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LayoutDashboard, CheckCircle2, CircleDot, Clock } from 'lucide-react';

const Dashboard = () => {
  // Lấy dữ liệu từ API thống kê mới tạo
  const { data: stats, isLoading, isError } = useGetTaskStatsQuery();

  if (isLoading)
    return (
      <div className="p-8 animate-pulse text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Đang phân tích dữ liệu hệ thống...</p>
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 m-8">
        Không thể tải thống kê. Vui lòng kiểm tra lại kết nối.
      </div>
    );

  // Cấu hình các thẻ hiển thị
  const statCards = [
    {
      label: 'Tổng công việc',
      value: stats?.total || 0,
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Đang thực hiện',
      value: (stats?.['Doing'] || 0) + (stats?.['In Progress'] || 0),
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-orange-100',
      textColor: 'text-orange-600',
    },
    {
      label: 'Đã hoàn thành',
      value: stats?.['Done'] || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Chưa bắt đầu',
      value: stats?.['None'] || 0,
      icon: CircleDot,
      color: 'from-slate-500 to-slate-700',
      shadow: 'shadow-slate-100',
      textColor: 'text-slate-600',
    },
  ];

  // Dữ liệu cho biểu đồ
  const chartData = [
    {
      name: 'Chưa bắt đầu',
      value: stats?.['None'] || 0,
      color: '#64748b',
      fullColor: 'rgb(100, 116, 139)',
    },
    {
      name: 'Đang làm',
      value: (stats?.['Doing'] || 0) + (stats?.['In Progress'] || 0),
      color: '#f59e0b',
      fullColor: 'rgb(245, 158, 11)',
    },
    {
      name: 'Đã xong',
      value: stats?.['Done'] || 0,
      color: '#10b981',
      fullColor: 'rgb(16, 185, 129)',
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            HỆ THỐNG QUẢN TRỊ
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Cập nhật tình hình công việc thời gian thực
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Ngày hiện tại
          </p>
          <p className="font-bold text-slate-700">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </header>

      {/* Grid hiển thị các thẻ Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-white rounded-4xl p-6 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl group`}
          >
            <div className="flex flex-col gap-4 relative z-10">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
              >
                <card.icon size={22} />
              </div>

              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-800 tabular-nums">
                    {card.value}
                  </h3>
                  <span
                    className={`text-[10px] font-black uppercase ${card.textColor}`}
                  >
                    Công việc
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pie Chart - Tỉ lệ phần trăm */}
        <div className="xl:col-span-1 bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            PHÂN BỔ TRẠNG THÁI
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - So sánh số lượng */}
        <div className="xl:col-span-2 bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            SO SÁNH CHI TIẾT
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
