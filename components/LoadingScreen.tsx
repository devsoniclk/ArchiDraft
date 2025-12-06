import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 10;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setIsFading(true);
        // Wait for fade out animation to finish before unmounting
        setTimeout(onComplete, 800);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Grid & Effects */}
      <div className="absolute inset-0 grid-bg opacity-40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#020617] to-[#020617] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
        
        {/* Logo Container */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.4)] ring-1 ring-white/20 transform transition-transform duration-500 hover:scale-105">
            <Layers className="w-16 h-16 text-white drop-shadow-md" />
          </div>
          
          {/* Orbiting particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 text-center">
            Archi<span className="text-cyan-400 text-glow">Draft</span>
        </h1>
        
        {/* Loading Text */}
        <div className="h-6 mb-8 flex items-center justify-center">
             <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
                {progress < 30 ? 'Initializing Neural Grid...' : 
                 progress < 60 ? 'Loading Architecture Models...' : 
                 progress < 90 ? 'Calibrating Render Engine...' : 
                 'System Ready'}
             </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative shadow-inner border border-white/5">
            {/* Progress Fill */}
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-200 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Shimmer effect on bar */}
              <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1s_infinite] skew-x-12"></div>
            </div>
        </div>
        
        {/* Percentage */}
        <div className="w-full flex justify-between mt-2 font-mono text-[10px] text-slate-500">
            <span>v2.5.0-beta</span>
            <span className="text-cyan-400">{Math.min(Math.round(progress), 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;