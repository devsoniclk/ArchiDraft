import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(Array.from(e.target.files));
    }
  };

  const validateAndProcess = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      alert('Please upload image files.');
      return;
    }
    
    if (validFiles.length < files.length) {
      alert('Some non-image files were skipped.');
    }

    onFilesSelect(validFiles);
  };

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer group glass-panel
        ${isDragging 
          ? 'border-cyan-500/70 bg-cyan-900/20 scale-[1.01] shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
          : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/5'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <div className="p-12 flex flex-col items-center text-center">
        <div className={`p-4 rounded-full mb-5 transition-all duration-300 ${isDragging ? 'bg-cyan-500/20' : 'bg-white/5 group-hover:bg-cyan-500/10'}`}>
          <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? 'text-cyan-400 drop-shadow-lg' : 'text-slate-500 group-hover:text-cyan-400'}`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 transition-colors ${isDragging ? 'text-cyan-100' : 'text-white'}`}>
          Upload Source Images
        </h3>
        <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
          Drag and drop your photos here, or click to browse.
          <br/><span className="text-xs text-slate-500 font-mono mt-1 block opacity-70">Supports JPG, PNG, WEBP</span>
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 border border-white/10 group-hover:border-cyan-500/30">
          Select Files
        </button>
      </div>
    </div>
  );
};

export default UploadZone;