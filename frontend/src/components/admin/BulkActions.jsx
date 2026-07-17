import React, { useState } from 'react';
import { Trash2, Archive, Send, Download, X } from 'lucide-react';

/**
 * BulkActions Toolbar
 * A floating, glassmorphism action bar that appears when items are selected.
 */
const BulkActions = ({ selectedCount, onClear, onAction }) => {
  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${selectedCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
      <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] rounded-2xl flex items-center p-2 gap-2 sm:gap-4">
        
        {/* Selection Info */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-r border-slate-700/50">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold ring-1 ring-purple-500/30">
            {selectedCount}
          </div>
          <span className="text-slate-200 font-medium text-sm hidden sm:inline-block">
            Selected
          </span>
          <button 
            onClick={onClear}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 pr-2">
          <button 
            onClick={() => onAction('publish')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-xl transition-all"
          >
            <Send size={16} />
            <span className="hidden sm:inline-block">Publish</span>
          </button>
          
          <button 
            onClick={() => onAction('archive')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition-all"
          >
            <Archive size={16} />
            <span className="hidden sm:inline-block">Archive</span>
          </button>

          <button 
            onClick={() => onAction('export')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-xl transition-all"
          >
            <Download size={16} />
            <span className="hidden sm:inline-block">Export CSV</span>
          </button>

          <div className="w-px h-6 bg-slate-700/50 mx-1 sm:mx-2"></div>

          <button 
            onClick={() => onAction('delete')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all group"
          >
            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline-block">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
