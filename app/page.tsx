"use client";

import React, { useState } from 'react';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  CheckCircle2, User, Droplets, Wind, Camera, Barcode, 
  ListChecks, Settings2, Moon, Sun
} from 'lucide-react';

export default function BaseLayer() {
  const [activeTab, setActiveTab] = useState<'routines' | 'search' | 'settings'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const handleAnalyze = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: searchQuery, profile }),
      });
      const data = await response.json();
      if (data.status === 'success') setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white transition-colors duration-300 pb-40">
        <div className="max-w-xl mx-auto p-6 pt-10">

          {/* ROUTINES TAB */}
          {activeTab === 'routines' && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <h2 className="text-3xl font-black mb-6">Routines</h2>
              <div className="bg-white dark:bg-[#1a1d23] p-12 rounded-[40px] text-center border border-slate-200 dark:border-white/5">
                <ListChecks size={48} className="mx-auto mb-4 text-slate-200 dark:text-white/10" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Morning • Night • Weekly</p>
              </div>
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <div className="animate-in fade-in">
              <header className="mb-12 text-center">
                <h1 className="text-5xl font-black italic tracking-tighter mb-2">BASE<span className="text-blue-600">LAYER</span></h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Ingredient Intelligence</p>
              </header>

              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="Search product..."
                  className="w-full p-6 pl-8 pr-20 rounded-4xl bg-white dark:bg-[#1a1d23] shadow-xl border-none text-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button onClick={handleAnalyze} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-full text-white shadow-lg active:scale-90 transition-transform">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                </button>
              </div>

              {result && (
                <div className="bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black leading-tight">{result.product}</h3>
                    <div className="text-3xl font-black text-blue-600 px-6 py-4 bg-blue-50 dark:bg-blue-500/10 rounded-[28px]">{result.score}</div>
                  </div>
                  {result.warnings?.map((w: any, i: number) => (
                    <div key={i} className="mb-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                      <p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle size={14}/> {w.name}</p>
                      <p className="text-xs text-red-600/80 dark:text-red-300/60 mt-1">{w.detail}</p>
                    </div>
                  ))}
                  {result.heroes?.map((h: any, i: number) => (
                    <div key={i} className="mb-3 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/20">
                      <p className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2"><Sparkles size={14}/> {h.name}</p>
                      <p className="text-xs text-green-600/80 dark:text-green-300/60 mt-1">{h.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black mb-6">Settings</h2>
              
              <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-4xl mb-6 border border-slate-200 dark:border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Appearance</h4>
                <div className="flex gap-2">
                  <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Sun size={18}/> Light</button>
                  <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-500/10 text-blue-400' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Moon size={18}/> Dark</button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-4xl border border-slate-200 dark:border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Skin & Hair Profile</h4>
                <div className="space-y-8">
                  {[
                    { label: 'Skin Type', icon: <Droplets size={16} className="text-blue-500"/>, keys: ['isOily', 'isDry', 'isCombination', 'isNormal'] },
                    { label: 'Concerns', icon: <ShieldCheck size={16} className="text-indigo-500"/>, keys: ['isSensitive', 'isAcneProne', 'isAging', 'isPoreCongested'] },
                    { label: 'Hair', icon: <Wind size={16} className="text-purple-500"/>, keys: ['isCurly', 'isThinning', 'isDandruff', 'isFrizz'] }
                  ].map((group) => (
                    <div key={group.label}>
                      <p className="text-sm font-bold mb-3 flex items-center gap-2">{group.icon} {group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.keys.map((key) => (
                          <button key={key} onClick={() => toggleOption(key)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${profile[key as keyof typeof profile] ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                            {key.replace('is', '')}
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