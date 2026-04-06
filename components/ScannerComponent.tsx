"use client";
import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, RefreshCw, X } from 'lucide-react';

export default function ScannerComponent({ onScanComplete, onClose }: { onScanComplete: (text: string) => void, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) { alert("Camera access denied."); }
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL('image/jpeg');

    Tesseract.recognize(imageData, 'eng', { 
      logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); } 
    }).then(({ data: { text } }) => {
      setLoading(false);
      onScanComplete(text);
      stopCamera();
    });
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-10000 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="absolute min-w-full min-h-full object-cover" />
        <div className="absolute inset-0 border-40 border-black/60 flex items-center justify-center">
          <div className="w-full h-48 border-2 border-blue-500 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_blue]" />
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-10 text-center">
            <RefreshCw className="animate-spin mb-4" size={40} />
            <div className="font-black text-xl uppercase italic">Analyzing Chemicals...</div>
            <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="bg-slate-900 p-8 flex justify-between items-center">
        <button onClick={stopCamera} className="p-4 bg-slate-800 text-white rounded-full"><X/></button>
        {!loading && <button onClick={capture} className="p-6 bg-blue-600 text-white rounded-full shadow-2xl active:scale-95 transition-all"><Camera size={32}/></button>}
        <button onClick={startCamera} className="p-4 bg-slate-800 text-white rounded-full"><RefreshCw/></button>
      </div>
    </div>
  );
}