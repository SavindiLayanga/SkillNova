import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CvActivityChart({ data, loading }) {
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="cv-activity-title">CV Analysis Activity</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0 || data.every(d => d.uploads === 0 && d.completed === 0)) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="cv-activity-title">CV Analysis Activity</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No CV activity data available.</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-h-[280px]">
      <h2 className="text-lg font-bold text-slate-950 mb-4" id="cv-activity-title">CV Analysis Activity</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            aria-labelledby="cv-activity-title"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="uploads" name="CV Uploads" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed Analyses" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
