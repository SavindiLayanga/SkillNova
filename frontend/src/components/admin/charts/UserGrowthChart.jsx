import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function UserGrowthChart({ data, loading }) {
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-growth-title">User Growth</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-growth-title">User Growth</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No user growth data available.</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-h-[280px]">
      <h2 className="text-lg font-bold text-slate-950 mb-4" id="user-growth-title">User Growth</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} aria-labelledby="user-growth-title" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="count" name="New Users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
