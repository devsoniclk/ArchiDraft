import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import StyleSelector from './components/StyleSelector';
import ComparisonSlider from './components/ComparisonSlider';
import WatermarkControls from './components/WatermarkControls';
import BatchSidebar from './components/BatchSidebar';
import AnalysisModal from './components/AnalysisModal';
import LoadingScreen from './components/LoadingScreen';
import { DrawingStyle, ProcessingState, BatchItem, WatermarkConfig, ImageFilter } from './types';
import { generateArchitecturalDrawing, removeBackground, analyzeImage } from './services/geminiService';
import { applyWatermark, applyImageFilter } from './services/imageService';
import { Wand2, RefreshCw, Trash2, AlertCircle, Image as ImageIcon, Sparkles, Eraser, Stamp, ScanEye, Palette, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  // App Loading State
  const [isAppLoading, setIsAppLoading] = useState(true);

  // State for Batch
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived state for current view
  const selectedItem = batchItems.find(item => item.id === selectedId) || null;
  const currentImage = selectedItem; // Alias for compatibility with logic
  
  const [selectedStyle, setSelectedStyle] = useState<DrawingStyle>(DrawingStyle.BLUEPRINT);
  const [status, setStatus] = useState<ProcessingState>({ status: 'idle' });
  const [isUpscale, setIsUpscale] = useState<boolean>(false);
  const [isRemoveBg, setIsRemoveBg] = useState<boolean>(false);
  const [targetAspectRatio, setTargetAspectRatio] = useState<string>("Auto");

  // Watermark State
  const [showWatermarkControls, setShowWatermarkControls] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: false,
    text: 'ArchiDraft AI',
    position: 'bottom-right',
    opacity: 50,
    font: 'Inter, sans-serif',
    color: '#FFFFFF',
    size: 40
  });

  // Analysis State
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const aspectRatios = ["Auto", "1:1", "3:4", "4:3", "9:16", "16:9"];

  // Filter Dropdown
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filters: ImageFilter[] = ['none', 'grayscale', 'sepia', 'vintage', 'high-contrast'];

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        // Optional key check
      }
    };
    checkApiKey();
  }, []);

  // Update displayed image for SELECTED item when watermark config changes or item changes
  useEffect(() => {
    const updateDisplay = async () => {
      if (!selectedItem || !selectedItem.generatedBase64) return;

      if (watermarkConfig.enabled) {
        try {
          const watermarked = await applyWatermark(selectedItem.generatedBase64, watermarkConfig);
          updateBatchItem(selectedItem.id, { displayedBase64: watermarked });
        } catch (err) {
          console.error("Error applying watermark:", err);
          updateBatchItem(selectedItem.id, { displayedBase64: selectedItem.generatedBase64 });
        }
      } else {
         if (selectedItem.displayedBase64 !== selectedItem.generatedBase64) {
            updateBatchItem(selectedItem.id, { displayedBase64: selectedItem.generatedBase64 });
         }
      }
    };

    // Debounce to prevent flashing on slider drag
    const timer = setTimeout(updateDisplay, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.generatedBase64, selectedItem?.id, watermarkConfig]);

  const updateBatchItem = (id: string, updates: Partial<BatchItem>) => {
    setBatchItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const getClosestAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    const ratios = [
      { id: "1:1", val: 1.0 },
      { id: "3:4", val: 0.75 },
      { id: "4:3", val: 1.333 },
      { id: "9:16", val: 0.5625 },
      { id: "16:9", val: 1.777 },
    ];
    
    return ratios.reduce((prev, curr) => 
      Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev
    ).id;
  };

  const processFiles = useCallback((files: File[]) => {
    const newItems: BatchItem[] = [];
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const base64 = (e.target!.result as string).split(',')[1];
            
            const newItem: BatchItem = {
              id: Math.random().toString(36).substring(7),
              file,
              previewUrl: url,
              base64: base64,
              originalBase64: base64, // Keep original
              mimeType: file.type,
              width: img.width,
              height: img.height,
              status: 'idle',
              currentFilter: 'none'
            };
            
            newItems.push(newItem);
            processedCount++;

            if (processedCount === files.length) {
              setBatchItems(prev => {
                const updated = [...prev, ...newItems];
                if (!selectedId && updated.length > 0) {
                  setSelectedId(updated[0].id);
                }
                return updated;
              });
            }
          };
          img.src = url;
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedId]);

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    if (batchItems.length <= 1) {
      setStatus({ status: 'idle' });
    }
  };

  const handleFilterChange = async (filter: ImageFilter) => {
    if (!selectedItem || !selectedItem.originalBase64) return;
    setShowFilterMenu(false);

    try {
      // 1. Apply filter to original base64
      const filteredDataUrl = await applyImageFilter(selectedItem.originalBase64, filter);
      const filteredBase64 = filteredDataUrl.split(',')[1];
      
      // 2. Update item with new base64 and current filter
      updateBatchItem(selectedItem.id, { 
        base64: filteredBase64,
        previewUrl: filteredDataUrl, // Update preview URL to show filtered result immediately
        currentFilter: filter
      });

    } catch (error) {
      console.error("Filter application failed:", error);
    }
  };

  const getFriendlyErrorMessage = (error: any): string => {
    const msg = error?.message || String(error);
    
    if (msg.includes('SAFETY')) return 'Content blocked by AI safety filters.';
    if (msg.includes('RECITATION')) return 'Blocked due to copyright/recitation.';
    if (msg.includes('429') || msg.includes('Quota') || msg.includes('Resource has been exhausted')) return 'API quota exceeded. Please try again later.';
    if (msg.includes('403')) return 'Access forbidden. Check API key permissions.';
    if (msg.includes('401') || msg.includes('API key')) return 'Invalid API Key.';
    if (msg.includes('503') || msg.includes('Overloaded')) return 'AI Service overloaded. Please retry.';
    if (msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed to fetch')) return 'Network error. Check your internet connection.';
    if (msg.includes('No image data')) return 'AI failed to generate a valid image.';
    
    return msg || 'An unexpected error occurred.';
  };

  const processItem = async (item: BatchItem, apiKey: string): Promise<void> => {
    try {
      updateBatchItem(item.id, { status: 'processing', errorMessage: undefined });
      
      let sourceBase64 = item.base64;
      let sourceMime = item.mimeType;

      // Determine the aspect ratio to use.
      // If Auto or not upscaling (fallback), we calculate based on image dimensions.
      // If Upscaling is active and a specific ratio is selected, we use that.
      const ratioToUse = (targetAspectRatio === 'Auto' || !isUpscale)
        ? getClosestAspectRatio(item.width, item.height)
        : targetAspectRatio;

      // Step 1: Background Removal
      if (isRemoveBg) {
        const bgRemovedDataUrl = await removeBackground(sourceBase64, sourceMime, isUpscale, ratioToUse);
        const matches = bgRemovedDataUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          sourceMime = matches[1];
          sourceBase64 = matches[2];
        }
      }

      // Step 2: Generate Drawing
      const resultBase64 = await generateArchitecturalDrawing(
        sourceBase64,
        sourceMime,
        selectedStyle,
        isUpscale,
        ratioToUse
      );

      // Step 3: Apply Watermark (if enabled)
      let finalDisplay = resultBase64;
      if (watermarkConfig.enabled) {
         try {
           finalDisplay = await applyWatermark(resultBase64, watermarkConfig);
         } catch (e) {
           console.warn("Watermark failed during batch", e);
         }
      }

      updateBatchItem(item.id, { 
        status: 'success', 
        generatedBase64: resultBase64,
        displayedBase64: finalDisplay
      });

    } catch (error: any) {
      console.error(`Error processing item ${item.id}:`, error);
      const friendlyMsg = getFriendlyErrorMessage(error);
      updateBatchItem(item.id, { 
        status: 'error', 
        errorMessage: friendlyMsg 
      });
    }
  };

  const handleGenerate = async () => {
    if (batchItems.length === 0) return;

    if ((isUpscale || isRemoveBg || batchItems.length > 0) && window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await window.aistudio.openSelectKey();
        } catch (e) {
          setStatus({ status: 'error', message: 'API Key selection cancelled or failed.' });
          return;
        }
      }
    }

    const itemsToProcess = batchItems.filter(i => i.status === 'idle' || i.status === 'error' || i.status === 'success');
    
    if (itemsToProcess.length === 0) return;

    setStatus({ 
      status: 'processing', 
      message: `Processing batch...`,
      total: itemsToProcess.length,
      current: 0
    });

    // Reset status for items we are about to process
    itemsToProcess.forEach(item => updateBatchItem(item.id, { status: 'processing' }));

    // Process sequentially to manage API load (or simple parallelism if quota permits)
    // We'll do sequential for safety and clear UI progress
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      setStatus(prev => ({ ...prev, current: i + 1, message: `Processing ${i+1}/${itemsToProcess.length}` }));
      
      // Need to re-fetch key if needed, but usually once is enough per session or component
      // Using process.env.API_KEY which is injected
      await processItem(item, process.env.API_KEY || '');
    }

    setStatus({ status: 'success', message: 'Batch processing complete' });
    setShowWatermarkControls(false);
  };

  const handleAnalyze = async () => {
    if (!selectedItem) return;

    setShowAnalysisModal(true);
    
    // If already analyzed, just show the modal
    if (selectedItem.analysis) return;

    // Check API Key
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      try {
        await window.aistudio.openSelectKey();
      } catch (e) {
         setShowAnalysisModal(false);
         return;
      }
    }

    updateBatchItem(selectedItem.id, { isAnalyzing: true });

    try {
      const analysisText = await analyzeImage(selectedItem.base64, selectedItem.mimeType);
      updateBatchItem(selectedItem.id, { 
        analysis: analysisText,
        isAnalyzing: false
      });
    } catch (error) {
      console.error("Analysis failed", error);
      const friendlyMsg = getFriendlyErrorMessage(error);
      updateBatchItem(selectedItem.id, { 
        isAnalyzing: false,
        analysis: `Error: ${friendlyMsg}`
      });
    }
  };

  const resetAll = () => {
    setBatchItems([]);
    setSelectedId(null);
    setStatus({ status: 'idle' });
  };

  const toggleWatermark = () => {
    if (!selectedItem?.generatedBase64) return;
    
    // Toggle UI panel
    setShowWatermarkControls(!showWatermarkControls);
    
    // If enabling for first time (or re-enabling), ensure 'enabled' is true in config
    if (!showWatermarkControls) {
      setWatermarkConfig(prev => ({ ...prev, enabled: true }));
    }
  };

  return (
    <div className="min-h-screen grid-bg font-sans selection:bg-cyan-500/30">
      
      {/* Loading Screen Overlay */}
      {isAppLoading && <LoadingScreen onComplete={() => setIsAppLoading(false)} />}

      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        
        {/* Hero Section */}
        {batchItems.length === 0 && (
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white text-glow">
              Turn Photos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Blueprints</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any image of a building, room, or object. Our AI analyzes geometry
              and renders precise architectural drawings in a flash.
            </p>

            <a 
              href="https://x.com/BeingDananjaye" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-2.5 glass-panel rounded-full hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors tracking-wide">
                Vibe Coded with Passion by Dananjaya
              </span>
            </a>
          </div>
        )}

        {/* Upload Section */}
        {batchItems.length === 0 && (
          <div className="animate-fade-in">
            <UploadZone onFilesSelect={processFiles} />
          </div>
        )}

        {/* Workspace Section */}
        {batchItems.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in items-start">
            
            {/* Sidebar (Desktop) / Top Bar (Mobile) */}
            <div className="w-full lg:w-48 lg:sticky lg:top-24 flex-shrink-0 order-2 lg:order-1 glass-panel rounded-2xl p-4 lg:max-h-[80vh] flex flex-col">
               <BatchSidebar 
                  items={batchItems} 
                  selectedId={selectedId} 
                  onSelect={setSelectedId} 
                  onRemove={removeBatchItem} 
               />
               <button onClick={resetAll} className="mt-4 w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Clear Queue
               </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col gap-6 order-1 lg:order-2 w-full">
                
                {/* Toolbar */}
                <div className={`glass-panel rounded-2xl shadow-xl sticky top-20 z-40 transition-all overflow-hidden border border-white/10`}>
                  <div className="p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                      {selectedItem && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-inner">
                            <img src={selectedItem.previewUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-white truncate max-w-[150px] sm:max-w-xs">
                              {selectedItem.file.name}
                            </h3>
                            <p className="text-xs text-slate-400">
                               {batchItems.length} items in batch
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                      {/* Configuration Controls - Always visible for batch */}
                      <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Filter Dropdown */}
                           <div className="relative">
                              <button 
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${selectedItem?.currentFilter !== 'none' ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                              >
                                <Palette className="w-4 h-4" />
                                <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">Filter</span>
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </button>
                              
                              {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 w-40 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                   <div className="p-1">
                                      {filters.map(f => (
                                        <button 
                                          key={f}
                                          onClick={() => handleFilterChange(f)}
                                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-cyan-400 rounded-lg capitalize transition-colors"
                                        >
                                          {f}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              )}
                           </div>

                          <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${isRemoveBg ? 'bg-purple-900/30 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                              <input 
                                type="checkbox" 
                                checked={isRemoveBg}
                                onChange={(e) => setIsRemoveBg(e.target.checked)}
                                className="hidden"
                              />
                              <Eraser className={`w-4 h-4 ${isRemoveBg ? 'text-purple-400' : 'text-slate-500'}`} />
                              <span className="text-sm font-medium whitespace-nowrap">Remove Bg</span>
                          </label>

                          <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${isUpscale ? 'bg-amber-900/30 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                              <input 
                                type="checkbox" 
                                checked={isUpscale}
                                onChange={(e) => setIsUpscale(e.target.checked)}
                                className="hidden"
                              />
                              <Sparkles className={`w-4 h-4 ${isUpscale ? 'text-amber-400' : 'text-slate-500'}`} />
                              <span className="text-sm font-medium whitespace-nowrap">Upscale (2K)</span>
                          </label>

                           {isUpscale && (
                              <div className="flex items-center bg-slate-900/50 rounded-lg p-1 border border-white/10 animate-fade-in overflow-x-auto max-w-[150px] scrollbar-hide">
                                {aspectRatios.map(ratio => (
                                  <button 
                                      key={ratio}
                                      onClick={() => setTargetAspectRatio(ratio)}
                                      className={`
                                        text-xs px-2 py-1.5 rounded-md transition-all whitespace-nowrap
                                        ${targetAspectRatio === ratio 
                                          ? 'bg-slate-700 text-white shadow-sm font-bold ring-1 ring-white/20' 
                                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
                                      `}
                                  >
                                    {ratio}
                                  </button>
                                ))}
                              </div>
                          )}
                      </div>

                      <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        
                        {/* Analyze Button */}
                        <button
                          onClick={handleAnalyze}
                          className={`
                             flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all
                             ${selectedItem?.analysis 
                               ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                               : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}
                          `}
                          title="Analyze Architectural Style"
                        >
                          <ScanEye className="w-4 h-4" />
                          <span className="hidden sm:inline">{selectedItem?.analysis ? 'View Analysis' : 'Analyze'}</span>
                        </button>

                        {selectedItem?.generatedBase64 && (
                           <button
                            onClick={toggleWatermark}
                            className={`
                              flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all
                              ${showWatermarkControls || watermarkConfig.enabled 
                                ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}
                            `}
                          >
                            <Stamp className="w-4 h-4" />
                            <span className="hidden sm:inline">Watermark</span>
                          </button>
                        )}
                        
                        <button
                          onClick={handleGenerate}
                          disabled={status.status === 'processing' && status.total === 0}
                          className={`
                            flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all
                            ${status.status === 'processing' 
                              ? 'bg-slate-700 cursor-wait' 
                              : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 hover:shadow-cyan-500/25 transform hover:-translate-y-0.5 active:scale-95'
                            }
                          `}
                        >
                          {status.status === 'processing' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              {status.current && status.total ? `Processing ${status.current}/${status.total}` : 'Processing...'}
                            </>
                          ) : (
                            <>
                              {batchItems.some(i => i.status === 'success') ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                              {batchItems.some(i => i.status === 'success') ? 'Regenerate' : 'Generate'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Watermark Controls Panel */}
                  {selectedItem?.generatedBase64 && showWatermarkControls && (
                    <WatermarkControls config={watermarkConfig} onChange={setWatermarkConfig} />
                  )}
                </div>

                {/* Error Message */}
                {status.status === 'error' && (
                  <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    {status.message}
                  </div>
                )}
                {selectedItem?.status === 'error' && (
                   <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Error processing this image: {selectedItem.errorMessage}
                  </div>
                )}

                {/* Style Selection (Applied to Batch) */}
                <section className="glass-panel p-6 rounded-2xl shadow-xl">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] ring-1 ring-cyan-500/50">1</span>
                    Select Batch Style
                  </h2>
                  <StyleSelector 
                    selectedStyle={selectedStyle} 
                    onSelect={setSelectedStyle} 
                    disabled={status.status === 'processing'}
                  />
                </section>

                {/* Main Display Area */}
                {selectedItem && (
                  <>
                  {selectedItem.status === 'processing' && !selectedItem.generatedBase64 && (
                     <div className="w-full aspect-[4/3] sm:aspect-[16/9] glass-panel rounded-xl shadow-inner flex flex-col items-center justify-center gap-6 relative overflow-hidden border border-white/10">
                       {/* Animated Mesh Gradient background */}
                       <div className="absolute inset-0 bg-slate-900/80"></div>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent w-full h-full skew-x-12 animate-[shimmer_2s_infinite]"></div>
                       
                       <div className="relative z-10 flex flex-col items-center">
                         <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
                         <h3 className="text-xl font-bold text-white animate-pulse">
                            Processing Item...
                         </h3>
                         <p className="text-cyan-400 font-mono text-sm mt-2 opacity-80">
                            AI IS HALLUCINATING ARCHITECTURE
                         </p>
                       </div>
                     </div>
                  )}

                  {selectedItem.displayedBase64 && (
                    <section className="animate-fade-in">
                       <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] ring-1 ring-cyan-500/50">2</span>
                        Result: <span className="text-white">{selectedItem.file.name}</span>
                        {isUpscale && <span className="ml-2 text-[10px] bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">2K • {targetAspectRatio}</span>}
                        {isRemoveBg && <span className="ml-2 text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">NO BG</span>}
                        {watermarkConfig.enabled && watermarkConfig.text && <span className="ml-2 text-[10px] bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">WATERMARK</span>}
                        {selectedItem.currentFilter !== 'none' && <span className="ml-2 text-[10px] bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">{selectedItem.currentFilter}</span>}
                      </h2>
                      <ComparisonSlider 
                          key={selectedItem.id + selectedItem.displayedBase64} // Force re-mount on change
                          original={selectedItem.previewUrl} 
                          generated={selectedItem.displayedBase64} 
                      />
                    </section>
                  )}

                   {!selectedItem.generatedBase64 && selectedItem.status !== 'processing' && selectedItem.status !== 'error' && (
                    <div className="w-full aspect-[4/3] sm:aspect-[16/9] glass-panel rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center group hover:border-white/20 transition-colors">
                        <div className="text-center text-slate-600 group-hover:text-slate-500 transition-colors">
                          <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                          <p className="font-mono text-sm">Preview awaiting generation...</p>
                        </div>
                    </div>
                  )}
                  </>
                )}
            </div>
          </div>
        )}

        {/* Analysis Modal */}
        <AnalysisModal 
          isOpen={showAnalysisModal} 
          onClose={() => setShowAnalysisModal(false)}
          analysis={selectedItem?.analysis || null}
          isAnalyzing={selectedItem?.isAnalyzing || false}
        />

      </main>
    </div>
  );
};

export default App;