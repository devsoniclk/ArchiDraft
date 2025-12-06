import React from 'react';
import { DrawingStyle } from '../types';
import { STYLE_DESCRIPTIONS } from '../constants';
import { PenTool, Box, Grid, Droplets, PenLine } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: DrawingStyle;
  onSelect: (style: DrawingStyle) => void;
  disabled: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  
  const getIcon = (style: DrawingStyle) => {
    switch (style) {
      case DrawingStyle.BLUEPRINT: return <Grid className="w-5 h-5" />;
      case DrawingStyle.WIREFRAME: return <Box className="w-5 h-5" />;
      case DrawingStyle.INK_WASH: return <Droplets className="w-5 h-5" />;
      case DrawingStyle.PENCIL_SKETCH: return <PenTool className="w-5 h-5" />;
      default: return <PenLine className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {Object.values(DrawingStyle).map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          disabled={disabled}
          className={`
            relative p-4 rounded-xl text-left transition-all duration-300 border flex flex-col gap-3 h-full overflow-hidden group
            ${selectedStyle === style 
              ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {selectedStyle === style && (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          )}
          
          <div className={`
            p-2 rounded-lg w-fit transition-colors duration-300
            ${selectedStyle === style ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400 group-hover:text-cyan-200'}
          `}>
            {getIcon(style)}
          </div>
          
          <div className="relative z-10">
            <h4 className={`font-semibold text-sm mb-1.5 transition-colors ${selectedStyle === style ? 'text-white' : 'text-slate-300'}`}>
              {style}
            </h4>
            <p className={`text-xs leading-relaxed transition-colors ${selectedStyle === style ? 'text-cyan-100/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
              {STYLE_DESCRIPTIONS[style]}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;