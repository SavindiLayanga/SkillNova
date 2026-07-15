import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TopSkillGapsChart({ data, loading }) {
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="top-skills-title">Most Common Skill Gaps</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-950 mb-4" id="top-skills-title">Most Common Skill Gaps</h2>
        <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No skill gaps data available.</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-h-[280px]">
      <h2 className="text-lg font-bold text-slate-950 mb-4" id="top-skills-title">Most Common Skill Gaps</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            aria-labelledby="top-skills-title"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis 
              dataKey="skill" 
              type="category" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Bar dataKey="count" name="Users Missing Skill" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
