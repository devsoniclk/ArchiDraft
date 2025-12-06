import React from 'react';
import { X, Copy, Check, ScanEye } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string | null;
  isAnalyzing: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis, isAnalyzing }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
               <ScanEye className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-bold text-lg tracking-tight">Architectural Analysis</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-300 leading-relaxed font-sans text-sm md:text-base">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.2)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                </div>
              </div>
              <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">Analyzing Neural Patterns...</p>
            </div>
          ) : analysis ? (
             <div className="space-y-4">
                {/* Simple markdown-like rendering replacement */}
                {analysis.split('\n').map((line, i) => {
                  // Headers
                  if (line.trim().startsWith('**') && line.trim().endsWith('**')) { // simplified check
                      return <h4 key={i} className="text-cyan-400 font-bold mt-6 mb-2 text-lg border-b border-white/5 pb-1 inline-block">{line.replace(/\*\*/g, '')}</h4>;
                  }
                  if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                          <p key={i} className="mb-2">
                              {parts.map((part, idx) => 
                                  idx % 2 === 1 ? <strong key={idx} className="text-white font-semibold drop-shadow-md">{part}</strong> : part
                              )}
                          </p>
                      );
                  }
                  return <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>;
                })}
             </div>
          ) : (
            <div className="text-center text-slate-500 py-8 italic">
              No analysis data available.
            </div>
          )}
        </div>

        {/* Footer */}
        {!isAnalyzing && analysis && (
          <div className="px-6 py-4 bg-slate-900/50 border-t border-white/10 flex justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors border border-white/10 hover:border-cyan-500/30"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Analysis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;