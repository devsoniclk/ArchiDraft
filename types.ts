
export enum DrawingStyle {
  BLUEPRINT = 'Blueprint',
  PENCIL_SKETCH = 'Pencil Sketch',
  TECHNICAL_LINE = 'Technical Line Drawing',
  INK_WASH = 'Ink Wash',
  WIREFRAME = '3D Wireframe'
}

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'high-contrast';

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number; // 0-100 for batch progress
  total?: number;
  current?: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

export interface BatchItem extends ImageFile {
  id: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  generatedBase64?: string | null; // The raw output from AI
  displayedBase64?: string | null; // The final output (with watermark)
  errorMessage?: string;
  analysis?: string | null;
  isAnalyzing?: boolean;
  originalBase64: string;
  currentFilter: ImageFilter;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  font: string;
  color: string;
  size: number;
}

// Global interface for the AI Studio window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
