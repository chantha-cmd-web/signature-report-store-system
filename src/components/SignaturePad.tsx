import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Trash2, Upload, Check, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  onCapture: (signatureDataUrl: string) => void;
  initialValue?: string | null;
}

export default function SignaturePad({ onCapture, initialValue = null }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#0F172A'); // Slate 900 (Deep blue-black)
  const [lineWidth, setLineWidth] = useState(3);
  const [hasSignature, setHasSignature] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialValue);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    if (initialValue) {
      setUploadedImage(initialValue);
      setHasSignature(true);
    }
  }, [initialValue]);

  // Handle canvas sizing and responsiveness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 500) * 2; // high DPI scaling
      canvas.height = 200 * 2;
      canvas.style.width = '100%';
      canvas.style.height = '200px';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = lineWidth;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [lineWidth, inkColor, mode]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
    setUploadedImage(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasData();
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export PNG
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setUploadedImage(null);
    onCapture('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImage(result);
      setHasSignature(true);
      onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Pencil className="w-4 h-4 text-emerald-600" />
          Digital Authorization Signature
        </label>
        
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-3 py-1 rounded-md transition-all ${
              mode === 'draw'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Draw Pad
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Upload PNG/JPG
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="relative border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 rounded-xl overflow-hidden shadow-inner">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full block cursor-crosshair bg-transparent"
            style={{ touchAction: 'none' }}
          />

          {/* Guidelines */}
          <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex flex-col items-center">
            <div className="w-[85%] border-b border-slate-300/80 dark:border-slate-700/80 border-dashed" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-600 mt-2">
              Sign Above This Line
            </span>
          </div>

          {/* Stroke Settings Drawer */}
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/90 dark:bg-slate-800/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex gap-1">
              {['#0F172A', '#1E40AF', '#B91C1C'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setInkColor(color)}
                  className={`w-4.5 h-4.5 rounded-full border ${
                    inkColor === color ? 'ring-2 ring-emerald-500 scale-110' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
            
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Weight:</span>
              <select
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="text-xs bg-transparent border-0 font-medium text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
              >
                <option value={2}>Thin</option>
                <option value={3.5}>Medium</option>
                <option value={5}>Thick</option>
              </select>
            </div>
          </div>

          {/* Action buttons inside Canvas card */}
          {hasSignature && (
            <button
              type="button"
              onClick={clearCanvas}
              className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/50 dark:border-rose-900/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Ink
            </button>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/80 relative min-h-[200px]">
          {uploadedImage ? (
            <div className="relative group max-h-[160px] flex flex-col items-center">
              <img
                src={uploadedImage}
                alt="Uploaded Signature"
                className="max-h-[120px] object-contain border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded p-2 shadow-sm"
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/50 dark:border-rose-900/50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Image
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center group w-full h-full justify-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-full text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Click to upload your digital signature
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                PNG, JPG, or SVG up to 5MB (Transparent backgrounds look best)
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
