import React from 'react';
import { X, Users, CheckCircle2, Star, Award, Clock, Eye, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultChartData = [
  { name: 'Jan', views: 0, enrollments: 0 },
  { name: 'Feb', views: 0, enrollments: 0 },
  { name: 'Mar', views: 0, enrollments: 0 },
  { name: 'Apr', views: 0, enrollments: 0 },
  { name: 'May', views: 0, enrollments: 0 },
  { name: 'Jun', views: 0, enrollments: 0 },
  { name: 'Jul', views: 0, enrollments: 0 },
];

const MetricCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          <TrendingUp size={12} className={trend < 0 ? 'transform rotate-180' : ''} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h4 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h4>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const CourseAnalyticsModal = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={24} />
              Course Analytics
            </h2>
            <p className="text-sm text-slate-500 mt-1">{course.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Enrollments" 
              value={course.students || 0} 
              icon={Users} 
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
            />
            <MetricCard 
              title="Completion Rate" 
              value={`${course.completionRate || 0}%`} 
              icon={CheckCircle2} 
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
            />
            <MetricCard 
              title="Rating" 
              value={course.rating || 0} 
              icon={Star} 
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
            />
            <MetricCard 
              title="Certificates Issued" 
              value={course.certificatesIssued || 0} 
              icon={Award} 
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
            />
            <MetricCard 
              title="Total Views" 
              value={course.totalViews || 0} 
              icon={Eye} 
              colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" 
            />
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <Calendar size={20} />
                </div>
                <h4 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Last Updated</h4>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Overview</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={course.chartData?.length > 0 ? course.chartData : defaultChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="enrollments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseAnalyticsModal;
