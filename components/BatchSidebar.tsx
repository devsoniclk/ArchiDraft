import React from 'react';
import { BatchItem } from '../types';
import { CheckCircle2, CircleDashed, AlertCircle, X, Loader2 } from 'lucide-react';

interface BatchSidebarProps {
  items: BatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const BatchSidebar: React.FC<BatchSidebarProps> = ({ items, selectedId, onSelect, onRemove }) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-widest">Queue ({items.length})</h3>
      </div>
      
      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              group relative flex-shrink-0 w-20 h-20 lg:w-full lg:h-auto lg:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border transition-all duration-300
              ${selectedId === item.id 
                ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/50' 
                : 'border-white/10 hover:border-white/30'
              }
            `}
          >
            <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-slate-900/0 transition-all z-10" />
            <img 
              src={item.generatedBase64 || item.previewUrl} 
              alt="Thumbnail" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Status Indicator */}
            <div className="absolute top-2 right-2 z-20">
              {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 bg-slate-900 rounded-full shadow-lg" />}
              {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400 bg-slate-900 rounded-full shadow-lg" />}
              {item.status === 'processing' && <Loader2 className="w-4 h-4 text-cyan-400 bg-slate-900 rounded-full animate-spin shadow-lg" />}
              {item.status === 'idle' && <CircleDashed className="w-4 h-4 text-slate-400 bg-slate-900 rounded-full shadow-lg" />}
            </div>

            {/* Remove Button (Hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-sm p-1 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-white/10"
            >
              <X className="w-3 h-3" />
            </button>
            
            {/* Active Indicator Bar */}
            {selectedId === item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 z-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchSidebar;