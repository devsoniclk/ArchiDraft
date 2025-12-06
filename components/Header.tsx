import React from 'react';
import { Layers, PenTool } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full glass-panel sticky top-0 z-50 border-b-0 border-b-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Archi<span className="text-cyan-400 text-glow">Draft</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
            <PenTool className="w-3.5 h-3.5 text-cyan-400" />
            AI-Powered Conversion
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;