import React from 'react';
import { X, PlayCircle, Star, Clock, BarChart, FileText, CheckCircle2 } from 'lucide-react';

const CoursePreviewModal = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Image / Video Placeholder */}
        <div className="relative h-48 sm:h-64 bg-slate-800 w-full shrink-0 group">
          {course.thumbnail ? (
            <img 
              src={URL.createObjectURL(course.thumbnail)} 
              alt={course.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-blue-600/80" />
          )}
          
          <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-transform hover:scale-110">
            <PlayCircle size={64} strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Course Details (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Main Info */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    {course.category || 'Programming'}
                  </span>
                  <div className="flex items-center text-amber-500 text-sm font-semibold">
                    <Star size={16} className="fill-amber-500 mr-1" />
                    {course.rating || '4.8'} (2.4k reviews)
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                  {course.title || 'Course Title'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                  by {course.provider || 'SkillNova Academy'}
                </p>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {course.description || "In this comprehensive course, you will learn everything you need to know about the subject from the ground up. This course is designed to take you from beginner to advanced with real-world projects and practical examples."}
              </p>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Skills you will gain</h3>
                <div className="flex flex-wrap gap-2">
                  {course.skills && course.skills.length > 0 ? (
                    course.skills.map((skill, index) => (
                      <span key={index} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Skills not specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-72 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6 sticky top-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      <BarChart size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Difficulty</p>
                      <p className="font-semibold">{course.difficulty || 'Beginner'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      <Clock size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Duration</p>
                      <p className="font-semibold">{course.duration || '10 Hours'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      <FileText size={20} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Certificate</p>
                      <p className="font-semibold">{course.certificate === 'Yes' ? 'Included' : 'Not Included'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-0.5">
                    Enroll for Free
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                    14-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;
