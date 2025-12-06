import React from 'react';
import { WatermarkConfig } from '../types';
import { Type, Grid3X3 } from 'lucide-react';

interface WatermarkControlsProps {
  config: WatermarkConfig;
  onChange: (config: WatermarkConfig) => void;
}

const WatermarkControls: React.FC<WatermarkControlsProps> = ({ config, onChange }) => {
  
  const updateConfig = (key: keyof WatermarkConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const positions = [
    { id: 'top-left', icon: <div className="flex flex-col justify-start items-start w-full h-full p-1"><div className="w-1.5 h-1.5 bg-current rounded-sm shadow-[0_0_5px_currentColor]"></div></div> },
    { id: 'top-right', icon: <div className="flex flex-col justify-start items-end w-full h-full p-1"><div className="w-1.5 h-1.5 bg-current rounded-sm shadow-[0_0_5px_currentColor]"></div></div> },
    { id: 'center', icon: <div className="flex flex-col justify-center items-center w-full h-full p-1"><div className="w-1.5 h-1.5 bg-current rounded-sm shadow-[0_0_5px_currentColor]"></div></div> },
    { id: 'bottom-left', icon: <div className="flex flex-col justify-end items-start w-full h-full p-1"><div className="w-1.5 h-1.5 bg-current rounded-sm shadow-[0_0_5px_currentColor]"></div></div> },
    { id: 'bottom-right', icon: <div className="flex flex-col justify-end items-end w-full h-full p-1"><div className="w-1.5 h-1.5 bg-current rounded-sm shadow-[0_0_5px_currentColor]"></div></div> },
  ];

  const fonts = [
    { name: 'Sans Serif', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'Times New Roman, serif' },
    { name: 'Monospace', value: 'JetBrains Mono, monospace' },
    { name: 'Handwritten', value: 'Brush Script MT, cursive' },
  ];

  const colors = [
    { name: 'White', value: '#FFFFFF', class: 'bg-white' },
    { name: 'Black', value: '#000000', class: 'bg-black border border-white/20' },
    { name: 'Cyan', value: '#06b6d4', class: 'bg-cyan-500' },
    { name: 'Red', value: '#DC2626', class: 'bg-red-600' },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-t border-white/10 p-4 sm:p-6 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Text Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Type className="w-3 h-3" /> Content
          </label>
          <input
            type="text"
            value={config.text}
            onChange={(e) => updateConfig('text', e.target.value)}
            placeholder="Enter watermark text..."
            className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
          />
          <div className="flex gap-2 mt-2">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => updateConfig('color', c.value)}
                className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${c.class} ${config.color === c.value ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-500' : ''}`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Position */}
        <div className="space-y-3">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" /> Position
          </label>
          <div className="flex gap-2">
             {positions.map((pos) => (
               <button
                  key={pos.id}
                  onClick={() => updateConfig('position', pos.id)}
                  className={`
                    w-10 h-10 rounded-lg border flex items-center justify-center transition-all
                    ${config.position === pos.id 
                      ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/10'}
                  `}
                  title={pos.id}
               >
                 {pos.icon}
               </button>
             ))}
          </div>
        </div>

        {/* Style Sliders */}
        <div className="space-y-4">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Appearance
          </label>
           
           <div className="space-y-1">
             <div className="flex justify-between text-xs text-slate-400 font-mono">
               <span>Opacity</span>
               <span>{config.opacity}%</span>
             </div>
             <input
                type="range"
                min="10"
                max="100"
                value={config.opacity}
                onChange={(e) => updateConfig('opacity', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
             />
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-xs text-slate-400 font-mono">
               <span>Size</span>
               <span>{config.size}%</span>
             </div>
             <input
                type="range"
                min="10"
                max="100"
                value={config.size}
                onChange={(e) => updateConfig('size', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
             />
           </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            Font Style
          </label>
          <div className="space-y-2">
             {fonts.map((f) => (
                <button
                  key={f.name}
                  onClick={() => updateConfig('font', f.value)}
                  className={`
                    w-full text-left px-3 py-1.5 rounded-lg text-sm border transition-all
                    ${config.font === f.value
                      ? 'bg-cyan-900/30 border-cyan-500/30 text-cyan-300 font-medium shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'}
                  `}
                  style={{ fontFamily: f.value }}
                >
                  {f.name}
                </button>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WatermarkControls;