import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ComparisonSliderProps {
  original: string;
  generated: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, generated }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e as unknown as MouseEvent).clientX - rect.left) / rect.width;
    setSliderPosition(Math.min(Math.max(x * 100, 0), 100));
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
     if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = (e as unknown as TouchEvent).touches[0];
    const x = (touch.clientX - rect.left) / rect.width;
    setSliderPosition(Math.min(Math.max(x * 100, 0), 100));
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const downloadAs = (format: 'png' | 'jpeg' | 'tiff') => {
    setShowMenu(false);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = generated;
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background for opaque formats
        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        let mimeType = 'image/png';
        let extension = 'png';

        switch (format) {
            case 'jpeg':
                mimeType = 'image/jpeg';
                extension = 'jpg';
                break;
            case 'tiff':
                mimeType = 'image/tiff';
                extension = 'tiff';
                break;
            default:
                mimeType = 'image/png';
                extension = 'png';
        }

        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `archidraft-drawing.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-slate-900 select-none cursor-ew-resize group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Comparison Image (Generated) - The 'After' */}
        <img
          src={generated}
          alt="Architectural Drawing"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Original Image (Before) - Clipped */}
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none border-r-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={original}
            alt="Original"
            className="absolute top-0 left-0 max-w-none h-full object-contain"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-transparent cursor-ew-resize z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 backdrop-blur-md rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center text-cyan-400">
            <div className="flex gap-1">
              <div className="w-0.5 h-4 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
              <div className="w-0.5 h-4 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-xs font-mono tracking-wider pointer-events-none">
          ORIGINAL
        </div>
        <div className="absolute bottom-4 right-4 bg-cyan-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-100 px-3 py-1 rounded-full text-xs font-mono tracking-wider pointer-events-none shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          GENERATED
        </div>
      </div>

      <div className="flex justify-between items-center glass-panel p-4 rounded-xl relative z-10">
        <p className="text-slate-400 text-sm hidden sm:block font-mono">
          Drag slider to compare details.
        </p>
        
        {/* Download Menu */}
        <div className="relative ml-auto" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all text-sm font-medium shadow-lg hover:shadow-cyan-500/25 active:scale-95 border border-white/10"
            >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right backdrop-blur-xl">
                    <div className="p-1.5 flex flex-col gap-0.5">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Select Format
                        </div>
                        <button onClick={() => downloadAs('png')} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-cyan-400 rounded-lg flex items-center group transition-colors">
                            <span className="font-medium">PNG</span> 
                            <span className="text-[10px] text-slate-500 ml-auto group-hover:text-cyan-400/70 border border-slate-700 rounded px-1.5 py-0.5">HQ</span>
                        </button>
                        <button onClick={() => downloadAs('jpeg')} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-cyan-400 rounded-lg flex items-center group transition-colors">
                             <span className="font-medium">JPEG</span> 
                             <span className="text-[10px] text-slate-500 ml-auto group-hover:text-cyan-400/70 border border-slate-700 rounded px-1.5 py-0.5">LITE</span>
                        </button>
                         <button onClick={() => downloadAs('tiff')} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-cyan-400 rounded-lg flex items-center group transition-colors">
                             <span className="font-medium">TIFF</span> 
                             <span className="text-[10px] text-slate-500 ml-auto group-hover:text-cyan-400/70 border border-slate-700 rounded px-1.5 py-0.5">PRINT</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;