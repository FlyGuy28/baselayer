"use client";

import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  Droplets, Wind, Camera, Barcode, ListChecks, Settings2, 
  Moon, Sun, Coffee, Sunset, Plus, Bath, ScanLine
} from 'lucide-react';
import ScannerComponent from '@/components/ScannerComponent';
import BarcodeScanner from '@/components/BarcodeScanner';

const PROFILE_ATTRIBUTES = [
  { label: 'Skin Type', keys: ['isOily', 'isDry', 'isCombination', 'isNormal', 'isDehydrated'] },
  { label: 'Skin Concerns', keys: ['isSensitive', 'isAcneProne', 'isFungalAcne', 'isRosacea', 'isEczema', 'isAging', 'isFineLines', 'isHyperpigmentation', 'isUnevenTexture', 'isPoreCongested'] },
  { label: 'Hair & Body', keys: ['isThinning', 'isDandruff', 'isDamaged', 'isFrizz', 'isDryBody', 'isDryHair', 'isOilyScalp'] }
];

export default function BaseLayer() {
  const [activeTab, setActiveTab] = useState<'routines' | 'search' | 'settings'>('search');
  const [showSurvey, setShowSurvey] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const [isManualMode, setIsManualMode] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');

  const [profile, setProfile] = useState<any>({ isDry: false });

  const ocrInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // --- THEME & PERSISTENCE ENGINE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('bl_theme');
    const savedProfile = localStorage.getItem('bl_profile');
    if (savedTheme === 'light') setIsDarkMode(false);
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    else setShowSurvey(true);
  }, []);

  useEffect(() => {
    // GLOBAL THEME FIX: Forces body background and HTML class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = "#0f1115"; 
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = "#f8fafc";
    }
    localStorage.setItem('bl_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleOption = (key: string) => {
    const newProfile = { ...profile, [key]: !profile[key] };
    setProfile(newProfile);
    localStorage.setItem('bl_profile', JSON.stringify(newProfile));
  };

  // --- OCR FILTERING ---
  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsManualMode(true);
    setOcrStatus("Scanning Label...");
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    const index = text.toUpperCase().indexOf("INGREDIENTS");
    const filtered = index !== -1 ? text.substring(index + 11) : text;
    setManualIngredients(filtered.trim());
    setOcrStatus("");
  };

  const handleCameraScan = (text: string) => {
    setIsManualMode(true);
    const index = text.toUpperCase().indexOf("INGREDIENTS");
    const filtered = index !== -1 ? text.substring(index + 11) : text;
    setManualIngredients(filtered.trim());
    setShowScanner(false);
  };

  const handleBarcodeScan = (code: string) => {
    setNewBarcode(code);
    setShowBarcodeScanner(false);
  };

  // --- SEARCH & ANALYZE ---
  const handleAnalyze = async (isManual = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product: isManual ? newProductName : searchQuery, 
          barcode: isManual ? newBarcode : null,
          ingredients: manualIngredients, 
          profile, 
          isManual 
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data);
        setIsManualMode(false);
      } else {
        alert("Product not in database. Please enter details manually.");
        setNewProductName(searchQuery);
        setIsManualMode(true);
      }
    } catch (err) {
      alert("Search failed. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white transition-colors duration-300 pb-32 font-sans">
      
      {/* --- SCANNER COMPONENTS --- */}
      {showScanner && <ScannerComponent onScanComplete={handleCameraScan} onClose={() => setShowScanner(false)} />}
      {showBarcodeScanner && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowBarcodeScanner(false)} />}
      
      {/* --- STANDALONE SURVEY --- */}
      {showSurvey && (
        <div className="fixed inset-0 z-100 bg-white dark:bg-[#0f1115] p-8 flex flex-col justify-center animate-in fade-in">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl font-black mb-4 italic tracking-tighter">BASELAYER SETUP</h1>
            <p className="text-slate-500 mb-8 font-medium">Select your primary skin or hair concerns to calibrate the AI.</p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {PROFILE_ATTRIBUTES.flatMap(g => g.keys).slice(0, 8).map(key => (
                <button key={key} onClick={() => toggleOption(key)} className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${profile[key] ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>
                  {key.replace('is', '').replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSurvey(false)} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg">COMPLETE PROFILE</button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto p-6 pt-12">
        <input type="file" accept="image/*" capture="environment" ref={ocrInputRef} onChange={handleOCR} className="hidden" />

        {/* --- SEARCH & MANUAL ENTRY --- */}
        {activeTab === 'search' && (
          <div className="animate-in fade-in">
            <header className="mb-12 text-center">
               <h1 className="text-5xl font-black italic tracking-tighter">BASE<span className="text-blue-600">LAYER</span></h1>
               <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-2 uppercase">Verified Intelligence</p>
            </header>

            {!isManualMode ? (
              <div className="relative mb-8">
                <input type="text" placeholder="Search brand or product..." className="w-full p-6 pl-8 rounded-4xl bg-white dark:bg-[#1a1d23] shadow-2xl border-none outline-none focus:ring-2 focus:ring-blue-600/20 text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(false)} />
                <button onClick={() => handleAnalyze(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-full text-white">{isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}</button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a1d23] p-8 rounded-[40px] border-2 border-blue-600 shadow-2xl mb-8">
                <div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl">Add New Product</h3><button onClick={() => setIsManualMode(false)} className="text-xs font-bold text-slate-400 uppercase">Cancel</button></div>
                <input type="text" placeholder="Product Name" className="w-full p-4 mb-3 rounded-2xl bg-slate-50 dark:bg-black/20 border-none outline-none font-bold" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                <input type="text" placeholder="Barcode (Optional)" className="w-full p-4 mb-4 rounded-2xl bg-slate-50 dark:bg-black/20 border-none outline-none text-sm" value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} />
                <textarea className="w-full h-32 bg-slate-50 dark:bg-black/20 p-5 rounded-2xl text-sm outline-none mb-4" value={manualIngredients} onChange={(e) => setManualIngredients(e.target.value)} placeholder="Paste ingredients or scan label..." />
                <div className="flex gap-2 mb-6">
                  <button onClick={() => ocrInputRef.current?.click()} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Camera size={16}/> {ocrStatus || "Scan Label"}</button>
                </div>
                <button onClick={() => handleAnalyze(true)} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold">SAVE & ANALYZE</button>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowScanner(true)} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#1a1d23] rounded-full text-xs font-black border border-slate-100 dark:border-white/5 shadow-xl"><Camera size={18} className="text-blue-600"/> SCAN LABEL</button>
              <button onClick={() => setShowBarcodeScanner(true)} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#1a1d23] rounded-full text-xs font-black border border-slate-100 dark:border-white/5 shadow-xl"><Barcode size={18} className="text-slate-400"/> BARCODE</button>
            </div>

            {/* --- RESULTS DISPLAY --- */}
            {result && !isManualMode && (
              <div className="mt-10 bg-white dark:bg-[#1a1d23] p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black">{result.product}</h3><div className="text-3xl font-black text-blue-600">{result.score}</div></div>
                {result.warnings.map((w: any, i: number) => <div key={i} className="mb-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm flex gap-2"><AlertTriangle size={16}/> {w.name}</div>)}
                {result.heroes.map((h: any, i: number) => <div key={i} className="mb-3 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400 font-bold text-sm flex gap-2"><Sparkles size={16}/> {h.name}</div>)}
              </div>
            )}
          </div>
        )}

        {/* --- ROUTINES TAB --- */}
        {activeTab === 'routines' && (
          <div className="animate-in slide-in-from-left-4">
            <h2 className="text-3xl font-black mb-8 italic">ROUTINES</h2>
            <div className="grid gap-4">
              {[{ name: "Morning Face", icon: <Coffee />, color: "text-orange-400" }, { name: "Night Face", icon: <Sunset />, color: "text-indigo-400" }, { name: "Hair Routine", icon: <Wind />, color: "text-blue-400" }, { name: "Body Care", icon: <Bath />, color: "text-emerald-400" }].map(r => (
                <div key={r.name} className="bg-white dark:bg-[#1a1d23] p-6 rounded-4xl flex items-center justify-between border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-4"><div className={`p-3 bg-slate-50 dark:bg-white/5 rounded-2xl ${r.color}`}>{r.icon}</div><p className="font-bold">{r.name}</p></div>
                  <Plus className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="animate-in slide-in-from-right-4">
            <h2 className="text-3xl font-black mb-8 italic uppercase">Settings</h2>
            <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-4xl mb-6 shadow-sm border border-slate-200 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Appearance</p>
              <div className="flex gap-2">
                <button onClick={() => setIsDarkMode(false)} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Sun size={18}/> Light</button>
                <button onClick={() => setIsDarkMode(true)} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-500/10 text-blue-400' : 'border-transparent bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Moon size={18}/> Dark</button>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-4xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Personal Profile</p>
              <div className="space-y-8">
                {PROFILE_ATTRIBUTES.map(group => (
                  <div key={group.label}><p className="text-sm font-bold mb-3">{group.label}</p><div className="flex flex-wrap gap-2">
                      {group.keys.map(key => (
                        <button key={key} onClick={() => toggleOption(key)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${profile[key] ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}>{key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}</button>
                      ))}
                    </div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- NAV BAR --- */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1a1d23] p-4 px-10 rounded-full flex items-center gap-12 shadow-2xl z-50 border border-white/10">
           <button onClick={() => setActiveTab('routines')} className={`${activeTab === 'routines' ? 'text-blue-500' : 'text-white/30'}`}><ListChecks size={26}/></button>
           <div onClick={() => setActiveTab('search')} className={`w-14 h-14 rounded-full flex items-center justify-center text-white relative -top-8 transition-all ${activeTab === 'search' ? 'bg-blue-600 scale-110 shadow-xl shadow-blue-500/50' : 'bg-slate-700'}`}><Search size={28}/></div>
           <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'text-blue-500' : 'text-white/30'}`}><Settings2 size={26}/></button>
        </div>
      </div>
    </div>
  );
}