import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#10b981', '#94a3b8']; // Emerald for active, Slate for inactive

export default function UserStatusChart({ data, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-status-title">User Account Status</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse">Loading chart...</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Active', value: data?.active || 0, statusKey: 'active' },
    { name: 'Inactive', value: data?.inactive || 0, statusKey: 'inactive' }
  ];

  if (chartData[0].value === 0 && chartData[1].value === 0) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-status-title">User Account Status</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No user status data available.</div>
      </div>
    );
  }

  const handleClick = (entry) => {
    if (entry && entry.statusKey) {
      navigate(`/admin/users?status=${entry.statusKey}`);
    }
  };

  return (
    <div className="h-full w-full flex flex-col min-h-[280px]">
      <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-status-title">User Account Status</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart aria-labelledby="user-status-title">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              onClick={handleClick}
              className="cursor-pointer outline-none focus:outline-none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity"
                  style={{ outline: 'none' }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
