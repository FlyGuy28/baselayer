"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onScan, onClose }: { onScan: (code: string) => void, onClose: () => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("barcode-reader", { fps: 10, qrbox: 250 }, false);
    
    scanner.render((text) => {
      onScan(text);
      scanner.clear();
    }, (err) => {});

    return () => { scanner.clear().catch(() => {}); };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-10000 bg-black flex flex-col items-center justify-center p-6">
      <div id="barcode-reader" className="w-full max-w-sm rounded-3xl overflow-hidden border-4 border-blue-600" />
      <button onClick={onClose} className="mt-8 px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest">Cancel</button>
    </div>
  );
}