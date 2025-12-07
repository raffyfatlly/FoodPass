import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Sparkles, PlusSquare, Image as ImageIcon, X, AlertCircle, RefreshCw, PenSquare, ArrowRight, ListPlus, ChevronRight } from 'lucide-react';

interface ScannerProps {
  onScan: (file: File) => void;
  onTextSearch: (query: string) => void;
  onManualAdd: () => void;
  isProcessing: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onTextSearch, onManualAdd, isProcessing }) => {
  const [textQuery, setTextQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // -- Text Search Handler --
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textQuery.trim()) {
      onTextSearch(textQuery);
      setTextQuery('');
    }
  };

  // -- Camera Logic --
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraStatus('loading');
    
    try {
      // Small delay to allow UI to render the overlay first
      await new Promise(r => setTimeout(r, 100));

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 }, // Good balance for performance
          height: { ideal: 720 } 
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly play() to ensure iOS compatibility
        try {
            await videoRef.current.play();
        } catch (e) {
            console.error("Play failed", e);
        }
      }
      setCameraStatus('active');

    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setCameraStatus('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraStatus('idle');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
            onScan(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onScan(e.target.files[0]);
      stopCamera();
    }
    e.target.value = ''; 
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6 py-2">
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* --- Viewfinder Trigger --- */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto group">
          {/* Pulsing Aura when processing */}
          {isProcessing && (
              <div className="absolute inset-0 bg-brand-500 rounded-[2.5rem] blur-[20px] opacity-40 animate-pulse"></div>
          )}
          
          <div className="absolute inset-4 bg-brand-500 rounded-[3rem] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>

          <button 
            onClick={startCamera}
            disabled={isProcessing}
            className={`relative w-full h-full rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center overflow-hidden transition-transform active:scale-[0.98] z-10 
              ${isProcessing ? 'cursor-wait ring-4 ring-brand-100 border-brand-200' : 'cursor-pointer hover:border-brand-200'}`}
          >
             {/* Corners */}
             <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-brand-500/20 rounded-tl-2xl"></div>
             <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-brand-500/20 rounded-tr-2xl"></div>
             <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-brand-500/20 rounded-bl-2xl"></div>
             <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-brand-500/20 rounded-br-2xl"></div>

             {isProcessing ? (
               <div className="flex flex-col items-center gap-5 animate-in fade-in duration-500">
                 <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
                    </div>
                 </div>
                 <span className="text-brand-600 font-bold animate-pulse text-lg tracking-tight">Identifying item...</span>
               </div>
             ) : (
               <>
                 <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Camera className="w-8 h-8 text-brand-500" />
                 </div>
                 <div className="text-center px-6">
                    <h3 className="text-xl font-bold text-slate-800">Scan Food</h3>
                    <p className="text-sm text-slate-400 mt-1">Tap to open camera</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium opacity-70">
                        Capture ingredients list for best accuracy
                    </p>
                 </div>
               </>
             )}
          </button>
        </div>

        {/* --- Divider --- */}
        <div className={`flex items-center gap-4 w-full max-w-[280px] opacity-60 transition-opacity duration-300 ${isProcessing ? 'opacity-30' : ''}`}>
            <div className="h-px bg-slate-200 flex-1 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-200 flex-1 rounded-full"></div>
        </div>

        {/* --- Input Actions Container --- */}
        <div className={`w-full max-w-[320px] space-y-4 transition-all duration-300 ${isProcessing ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
           
           {/* AI Prompt Box */}
           <form onSubmit={handleTextSubmit} className="relative group z-10">
              <div className="relative bg-white p-1.5 rounded-3xl shadow-sm border border-slate-200 transition-all focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500/30 hover:border-brand-200 hover:shadow-md">
                  <div className="flex flex-col px-3 pt-2 pb-1">
                      <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3 h-3 text-brand-500" />
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type to Auto-Fill (AI)</label>
                      </div>
                      <div className="flex items-center">
                        <input
                            type="text"
                            value={textQuery}
                            onChange={(e) => setTextQuery(e.target.value)}
                            placeholder="e.g. 3 packs of Maggi Kari noodles..."
                            disabled={isProcessing}
                            className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-300 outline-none font-medium text-sm py-2"
                        />
                        <button 
                            type="submit"
                            disabled={isProcessing || !textQuery.trim()}
                            className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 hover:bg-brand-500 hover:shadow-brand-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                  </div>
              </div>
           </form>

           {/* Manual Add - Distinct Premium Card Style */}
           <button 
             onClick={onManualAdd}
             className="w-full bg-slate-50 p-2 pl-3 rounded-3xl border border-transparent flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white hover:border-slate-200 hover:shadow-md"
           >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm group-hover:text-brand-500 transition-colors">
                 <PenSquare className="w-5 h-5" />
               </div>
               <div className="text-left">
                 <p className="text-sm font-bold text-slate-800">Manual Entry</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fill details yourself</p>
               </div>
             </div>
             <div className="pr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                 </div>
             </div>
           </button>

        </div>
      </div>

      {/* --- Full Screen Camera Overlay --- */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
           
           {/* Header */}
           <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 pointer-events-none">
              <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white/80 text-xs font-medium border border-white/10">
                 {cameraStatus === 'active' ? 'Photo Mode' : 'Connecting...'}
              </div>
              <button 
                onClick={stopCamera}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors pointer-events-auto"
              >
                 <X className="w-5 h-5" />
              </button>
           </div>

           {/* Main Content Area */}
           <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
              
              {/* LOADING STATE */}
              {cameraStatus === 'loading' && (
                  <div className="flex flex-col items-center gap-4 text-white/80">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-brand-500 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Starting Camera...</p>
                  </div>
              )}

              {/* VIDEO ACTIVE STATE */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-500 ${cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* ERROR STATE */}
              {cameraStatus === 'error' && (
                  <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-6">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-white mb-2">Camera Unavailable</h3>
                          <p className="text-slate-400 text-sm">We couldn't access your camera. Please allow camera permissions or upload a photo manually.</p>
                      </div>
                      
                      <button 
                        onClick={startCamera}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium flex items-center gap-2 hover:bg-slate-700 transition-colors"
                      >
                          <RefreshCw className="w-4 h-4" /> Retry
                      </button>
                      
                      <div className="w-full h-px bg-slate-800 my-4"></div>
                      
                      <button 
                         onClick={triggerFileUpload}
                         className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                      >
                          Upload from Gallery
                      </button>
                  </div>
              )}

              {/* Grid Overlay (Only when active) */}
              {cameraStatus === 'active' && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    <div className="border-r border-white/30"></div>
                    <div className="border-r border-white/30"></div>
                    <div className="border-r border-transparent"></div>
                    <div className="border-t border-white/30 col-span-3"></div>
                    <div className="border-t border-white/30 col-span-3"></div>
                </div>
              )}
           </div>

           {/* Controls Footer */}
           {/* We show controls even in 'error' state lightly, but mainly for active */}
           {cameraStatus !== 'error' && (
               <div className="h-32 bg-black flex items-center justify-center gap-12 px-6 pb-6 pt-2 z-30">
                   
                   {/* Upload Button */}
                   <button 
                     onClick={triggerFileUpload}
                     className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/20"
                     title="Upload Photo"
                   >
                     <ImageIcon className="w-6 h-6" />
                   </button>

                   {/* Shutter Button (Only active when camera is active) */}
                   <button 
                     onClick={takePhoto}
                     disabled={cameraStatus !== 'active'}
                     className={`w-20 h-20 rounded-full border-4 flex items-center justify-center p-1 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] 
                        ${cameraStatus === 'active' 
                            ? 'border-white active:scale-95 cursor-pointer opacity-100' 
                            : 'border-white/20 opacity-50 cursor-not-allowed'}`}
                   >
                     <div className={`w-full h-full rounded-full transition-colors ${cameraStatus === 'active' ? 'bg-white' : 'bg-white/20'}`} />
                   </button>

                   {/* Spacer */}
                   <div className="w-12 h-12" />
               </div>
           )}
        </div>
      )}
    </>
  );
};

export default Scanner;