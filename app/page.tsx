"use client";

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  Droplets, Wind, Camera, Barcode, ListChecks, Settings2, 
  Moon, Sun, Coffee, Sunset, Calendar, Plus, Database, ScanLine
} from 'lucide-react';

export default function BaseLayer() {
  const [activeTab, setActiveTab] = useState<'routines' | 'search' | 'settings'>('search');
  
  // Search & Manual State
  const [searchQuery, setSearchQuery] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Hardware/Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Hidden File Inputs for Mobile Camera Access
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    isOily: false, isDry: false, isCombination: false, isNormal: false,
    isSensitive: false, isAcneProne: false, isFungalAcne: false, 
    isRosacea: false, isEczema: false, isAging: false, 
    isHyperpigmentation: false, isDehydrated: false,
    isPoreCongested: false, isUnevenTexture: false, isFineLines: false,
    isStraight: false, isWavy: false, isCurly: false, isCoily: false,
    isThinning: false, isDryHair: false, isOilyScalp: false,
    isDandruff: false, isFrizz: false, isDamaged: false
  });

  const toggleOption = (key: string) => {
    setProfile(prev => ({ ...prev, [key]: !prev[key as keyof typeof profile] }));
  };

  // --- STANDARD SEARCH ---
  const handleAnalyze = async (isManual: boolean = false) => {
    setIsLoading(true);
    setResult(null);
    
    const payload = isManual 
      ? { product: newProductName || "Custom Entry", ingredients: manualIngredients, profile }
      : { product: searchQuery, profile };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data);
        setIsManualMode(false);
        setNewProductName('');
        setManualIngredients('');
      } else if (data.status === 'not_found') {
        alert("Product not in database. Opening Camera scanner to add it!");
        setNewProductName(searchQuery);
        setIsManualMode(true);
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  // --- OCR CAMERA SCANNER ---
  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsManualMode(true);
    setOcrStatus("Initializing Camera AI...");
    
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`Reading Label: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      // Clean up the OCR text slightly
      const cleanText = text.replace(/\n/g, ', ').replace(/,,/g, ',');
      setManualIngredients(cleanText);
      setOcrStatus("");
    } catch (err) {
      console.error(err);
      setOcrStatus("Failed to read image. Please type manually.");
    }
  };

  // --- BARCODE SCANNER (SIMULATED FOR DB MISS) ---
  const handleBarcodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you'd pass this image to a ZXing library.
    // For this flow, we trigger the "Not Found -> Add to DB" logic you requested.
    if (e.target.files?.[0]) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert("Barcode not recognized in Database. Please scan the Ingredient Label to add it!");
        setIsManualMode(true);
      }, 1500);
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white transition-all duration-500 pb-40">
        <div className="max-w-xl mx-auto p-6 pt-10">

          {/* Hidden HTML5 Camera Inputs */}
          <input type="file" accept="image/*" capture="environment" ref={ocrInputRef} onChange={handleOCRUpload} className="hidden" />
          <input type="file" accept="image/*" capture="environment" ref={barcodeInputRef} onChange={handleBarcodeUpload} className="hidden" />

          {/* --- ROUTINES TAB --- */}
          {activeTab === 'routines' && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <h2 className="text-3xl font-black mb-8 tracking-tighter">My Routines</h2>
              <div className="space-y-4">
                {[
                  { label: "Morning", icon: <Coffee className="text-orange-400" />, time: "AM" },
                  { label: "Night", icon: <Sunset className="text-indigo-400" />, time: "PM" },
                  { label: "Weekly", icon: <Calendar className="text-emerald-400" />, time: "Treatments" }
                ].map((r) => (
                  <div key={r.label} className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] flex items-center justify-between border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4"><div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">{r.icon}</div><div><p className="font-bold text-lg">{r.label}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.time}</p></div></div>
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 font-bold">+</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SEARCH TAB --- */}
          {activeTab === 'search' && (
            <div className="animate-in fade-in">
              <header className="mb-12 text-center">
                <h1 className="text-5xl font-black italic tracking-tighter mb-2">BASE<span className="text-blue-600">LAYER</span></h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Ingredient Intelligence</p>
              </header>

              {!isManualMode && (
                <>
                  <div className="relative mb-6">
                    <input type="text" placeholder="Search database..." className="w-full p-6 pl-8 pr-20 rounded-[32px] bg-white dark:bg-[#1a1d23] shadow-xl border-none text-lg outline-none focus:ring-2 focus:ring-blue-500/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(false)} />
                    <button onClick={() => handleAnalyze(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-full text-white shadow-lg">
                      {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                    </button>
                  </div>

                  <div className="flex gap-4 mb-10 justify-center">
                    <button onClick={() => ocrInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1d23] rounded-full text-[11px] font-black border border-slate-100 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"><Camera size={16} className="text-blue-500"/> SCAN LABEL</button>
                    <button onClick={() => barcodeInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1d23] rounded-full text-[11px] font-black border border-slate-100 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"><Barcode size={16} className="text-slate-500"/> BARCODE</button>
                    <button onClick={() => setIsManualMode(true)} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1d23] rounded-full text-[11px] font-black border border-slate-100 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"><Plus size={16}/></button>
                  </div>
                </>
              )}

              {/* MANUAL / OCR ENTRY UI */}
              {isManualMode && (
                <div className="bg-white dark:bg-[#1a1d23] p-8 rounded-[40px] mb-8 shadow-2xl border-2 border-blue-500/20 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black flex items-center gap-2"><ScanLine size={20} className="text-blue-500"/> Add Product</h3>
                    <button onClick={() => setIsManualMode(false)} className="text-xs font-bold text-slate-400">CANCEL</button>
                  </div>
                  
                  <input type="text" placeholder="Product Name..." className="w-full p-4 mb-4 rounded-2xl bg-slate-50 dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                  
                  <div className="relative">
                    <textarea className="w-full h-40 p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border-none text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="Scan label or paste ingredients here..." value={manualIngredients} onChange={(e) => setManualIngredients(e.target.value)} />
                    {ocrStatus && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-[#1a1d23]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                        <Loader2 className="animate-spin text-blue-500 mb-2" size={32}/>
                        <p className="font-bold text-sm">{ocrStatus}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => ocrInputRef.current?.click()} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold flex items-center justify-center gap-2"><Camera size={18}/> Scan Label</button>
                    <button onClick={() => handleAnalyze(true)} disabled={!manualIngredients} className="flex-[2] py-4 bg-blue-600 rounded-2xl text-white font-bold disabled:opacity-50">Analyze & Save</button>
                  </div>
                </div>
              )}

              {/* ANALYSIS RESULTS */}
              {result && !isManualMode && (
                <div className="bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black leading-tight">{result.product}</h3>
                    <div className="text-3xl font-black text-blue-600 px-6 py-4 bg-blue-50 dark:bg-blue-500/10 rounded-[28px]">{result.score}</div>
                  </div>
                  {result.warnings?.map((w: any, i: number) => (
                    <div key={i} className="mb-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20"><p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle size={14}/> {w.name}</p><p className="text-xs text-red-600/80 dark:text-red-300/60 mt-1">{w.detail}</p></div>
                  ))}
                  {result.heroes?.map((h: any, i: number) => (
                    <div key={i} className="mb-3 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/20"><p className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2"><Sparkles size={14}/> {h.name}</p><p className="text-xs text-green-600/80 dark:text-green-300/60 mt-1">{h.detail}</p></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black mb-6">Settings</h2>
              <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] mb-6 border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Appearance</h4>
                <div className="flex gap-2">
                  <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Sun size={18}/> Light</button>
                  <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-500/10 text-blue-400' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Moon size={18}/> Dark</button>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Profile Attributes</h4>
                <div className="space-y-8">
                  {[
                    { label: 'Skin Type', icon: <Droplets size={16} className="text-blue-500"/>, keys: ['isOily', 'isDry', 'isCombination', 'isNormal'] },
                    { label: 'Skin Concerns', icon: <ShieldCheck size={16} className="text-indigo-500"/>, keys: ['isSensitive', 'isAcneProne', 'isFungalAcne', 'isRosacea', 'isEczema', 'isAging', 'isHyperpigmentation', 'isDehydrated', 'isPoreCongested', 'isUnevenTexture', 'isFineLines'] },
                    { label: 'Hair Type', icon: <Wind size={16} className="text-purple-500"/>, keys: ['isStraight', 'isWavy', 'isCurly', 'isCoily'] },
                    { label: 'Hair Concerns', icon: <Sparkles size={16} className="text-pink-500"/>, keys: ['isThinning', 'isDryHair', 'isOilyScalp', 'isDandruff', 'isFrizz', 'isDamaged'] }
                  ].map((group) => (
                    <div key={group.label}>
                      <p className="text-sm font-bold mb-3 flex items-center gap-2">{group.icon} {group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.keys.map((key) => (
                          <button key={key} onClick={() => toggleOption(key)} className={`px-4 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${profile[key as keyof typeof profile] ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:border-slate-200'}`}>
                            {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NAV SHELF */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1a1d23] p-3 px-8 rounded-full flex items-center gap-12 shadow-2xl z-50 border border-white/10">
             <button onClick={() => setActiveTab('routines')} className={`${activeTab === 'routines' ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}><ListChecks size={24} /></button>
             <div onClick={() => setActiveTab('search')} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg relative -top-6 cursor-pointer transition-all ${activeTab === 'search' ? 'bg-blue-600 scale-110 shadow-blue-500/50' : 'bg-slate-700'}`}><Search size={28} /></div>
             <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}><Settings2 size={24} /></button>
          </div>

        </div>
      </div>
    </div>
  );
}