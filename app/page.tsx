"use client";

import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  Droplets, Wind, Camera, Barcode, ListChecks, Settings2, 
  Moon, Sun, Coffee, Sunset, Plus, Bath, CheckCircle2
} from 'lucide-react';

export default function BaseLayer() {
  const [activeTab, setActiveTab] = useState<'routines' | 'search' | 'settings'>('search');
  const [showSurvey, setShowSurvey] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [profile, setProfile] = useState({
    isOily: false, isDry: false, isCombination: false, isNormal: false,
    isSensitive: false, isAcneProne: false, isFungalAcne: false, 
    isAging: false, isPoreCongested: false, isDehydrated: false,
    isCurly: false, isThinning: false, isDandruff: false, isDamaged: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // --- PERSISTENCE & THEME ENGINE ---
  useEffect(() => {
    const savedProfile = localStorage.getItem('bl_profile');
    const savedTheme = localStorage.getItem('bl_theme');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    else setShowSurvey(true);
    if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    // Global Theme Fix: Apply to Document Root
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('bl_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleOption = (key: string) => {
    const newProfile = { ...profile, [key]: !profile[key as keyof typeof profile] };
    setProfile(newProfile);
    localStorage.setItem('bl_profile', JSON.stringify(newProfile));
  };

  // --- INTELLIGENT OCR FILTER ---
  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsManualMode(true);
    setOcrStatus("Filtering Label...");
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    
    // Look for "Ingredients" and discard everything before it
    const index = text.toUpperCase().indexOf("INGREDIENTS");
    const filtered = index !== -1 ? text.substring(index + 11) : text;
    setManualIngredients(filtered.trim());
    setOcrStatus("");
  };

  const handleAnalyze = async (isManual = false) => {
    setIsLoading(true);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: isManual ? "Manual Entry" : searchQuery, ingredients: manualIngredients, profile, isManual }),
    });
    const data = await res.json();
    if (data.status === 'success') {
      setResult(data);
      setIsManualMode(false);
    } else {
      alert("Not found. Please use Manual Entry or Scan Label!");
      setIsManualMode(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white transition-colors duration-500 pb-40 font-sans">
      
      {/* SURVEY MODAL */}
      {showSurvey && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f1115] flex items-center justify-center p-8">
          <div className="max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter italic">BASELAYER</h1>
            <p className="text-slate-500 mb-8 font-medium">Your personalized ingredient safety engine.</p>
            <button onClick={() => {setShowSurvey(false); setActiveTab('settings')}} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg">Start Profile Setup</button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto p-6 pt-12">
        <input type="file" accept="image/*" capture="environment" ref={ocrInputRef} onChange={handleOCR} className="hidden" />

        {/* ROUTINES (FACE, HAIR, BODY) */}
        {activeTab === 'routines' && (
          <div className="animate-in fade-in slide-in-from-left-4">
            <h2 className="text-3xl font-black mb-8 italic">ROUTINES</h2>
            <div className="grid gap-4">
              {[
                { name: "Morning Face", icon: <Coffee />, color: "text-orange-400" },
                { name: "Night Face", icon: <Sunset />, color: "text-indigo-400" },
                { name: "Hair Routine", icon: <Wind />, color: "text-blue-400" },
                { name: "Body Care", icon: <Bath />, color: "text-emerald-400" }
              ].map(r => (
                <div key={r.name} className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] flex items-center justify-between border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-4"><div className={`p-3 bg-slate-50 dark:bg-white/5 rounded-2xl ${r.color}`}>{r.icon}</div><p className="font-bold">{r.name}</p></div>
                  <Plus className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH & OCR */}
        {activeTab === 'search' && (
          <div className="animate-in fade-in">
            <header className="mb-12 text-center">
               <h1 className="text-5xl font-black italic tracking-tighter">BASE<span className="text-blue-600">LAYER</span></h1>
               <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-2 uppercase">Verified Intelligence</p>
            </header>

            {!isManualMode ? (
              <div className="relative mb-8">
                <input type="text" placeholder="Search product..." className="w-full p-6 pl-8 rounded-[32px] bg-white dark:bg-[#1a1d23] shadow-2xl border-none outline-none focus:ring-2 focus:ring-blue-600/20 text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button onClick={() => handleAnalyze(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-full text-white shadow-lg">{isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}</button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a1d23] p-8 rounded-[40px] border-2 border-blue-600 shadow-2xl mb-8 animate-in zoom-in-95">
                <h3 className="font-black text-xl mb-4">Verification Entry</h3>
                <textarea className="w-full h-40 bg-slate-50 dark:bg-black/20 p-5 rounded-3xl text-sm outline-none" value={manualIngredients} onChange={(e) => setManualIngredients(e.target.value)} placeholder="Paste or scan ingredients..." />
                {ocrStatus && <p className="text-blue-500 font-bold text-xs mt-2 animate-pulse">{ocrStatus}</p>}
                <button onClick={() => handleAnalyze(true)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] mt-6 font-bold">Analyze & Verify</button>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => ocrInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#1a1d23] rounded-full text-xs font-black border border-slate-100 dark:border-white/5 shadow-xl"><Camera size={18} className="text-blue-600"/> SCAN LABEL</button>
              <button className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#1a1d23] rounded-full text-xs font-black border border-slate-100 dark:border-white/5 shadow-xl"><Barcode size={18} className="text-slate-400"/> BARCODE</button>
            </div>

            {result && !isManualMode && (
              <div className="mt-10 bg-white dark:bg-[#1a1d23] p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black">{result.product}</h3><div className="text-3xl font-black text-blue-600">{result.score}</div></div>
                {result.warnings.map((w: any, i: number) => <div key={i} className="mb-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm flex gap-2"><AlertTriangle size={16}/> {w.name}</div>)}
                {result.heroes.map((h: any, i: number) => <div key={i} className="mb-3 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400 font-bold text-sm flex gap-2"><Sparkles size={16}/> {h.name}</div>)}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-in slide-in-from-right-4">
            <h2 className="text-3xl font-black mb-8 italic">SETTINGS</h2>
            <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] mb-6 shadow-sm border border-slate-200 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Appearance</p>
              <div className="flex gap-2">
                <button onClick={() => setIsDarkMode(false)} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Sun size={18}/> Light</button>
                <button onClick={() => setIsDarkMode(true)} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-500/10 text-blue-400' : 'border-transparent bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Moon size={18}/> Dark</button>
              </div>
            </div>
            {/* Attributes Mapping ... (similar to previous code, but using LocalStorage toggle) */}
          </div>
        )}

        {/* NAV SHELF */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1a1d23] p-4 px-10 rounded-full flex items-center gap-12 shadow-2xl z-50 border border-white/10">
           <button onClick={() => setActiveTab('routines')} className={`${activeTab === 'routines' ? 'text-blue-500' : 'text-white/30'}`}><ListChecks size={26}/></button>
           <div onClick={() => setActiveTab('search')} className={`w-14 h-14 rounded-full flex items-center justify-center text-white relative -top-8 transition-all ${activeTab === 'search' ? 'bg-blue-600 scale-110 shadow-xl shadow-blue-500/50' : 'bg-slate-700'}`}><Search size={28}/></div>
           <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'text-blue-500' : 'text-white/30'}`}><Settings2 size={26}/></button>
        </div>
      </div>
    </div>
  );
}