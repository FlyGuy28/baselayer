"use client";

import React, { useState } from 'react';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  Droplets, Wind, Camera, Barcode, ListChecks, Settings2, 
  Moon, Sun, Coffee, Sunset, Calendar
} from 'lucide-react';

export default function BaseLayer() {
  const [activeTab, setActiveTab] = useState<'routines' | 'search' | 'settings'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [profile, setProfile] = useState({
    // Skin Types
    isOily: false, isDry: false, isCombination: false, isNormal: false,
    // Skin Concerns
    isSensitive: false, isAcneProne: false, isFungalAcne: false, 
    isRosacea: false, isEczema: false, isAging: false, 
    isHyperpigmentation: false, isDehydrated: false,
    isPoreCongested: false, isUnevenTexture: false, isFineLines: false,
    // Hair Types
    isStraight: false, isWavy: false, isCurly: false, isCoily: false,
    // Hair Concerns
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
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white transition-all duration-500 pb-40">
        <div className="max-w-xl mx-auto p-6 pt-10">

          {/* --- ROUTINES TAB (SPLIT UP) --- */}
          {activeTab === 'routines' && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <h2 className="text-3xl font-black mb-8">My Routines</h2>
              <div className="space-y-4">
                {[
                  { label: "Morning Routine", icon: <Coffee className="text-orange-400" />, time: "AM" },
                  { label: "Night Routine", icon: <Sunset className="text-indigo-400" />, time: "PM" },
                  { label: "Weekly Treatments", icon: <Calendar className="text-emerald-400" />, time: "Special" }
                ].map((r) => (
                  <div key={r.label} className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] flex items-center justify-between border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">{r.icon}</div>
                      <div>
                        <p className="font-bold text-lg">{r.label}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.time}</p>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300">+</div>
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

              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="Search product..."
                  className="w-full p-6 pl-8 pr-20 rounded-[32px] bg-white dark:bg-[#1a1d23] shadow-xl border-none text-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button onClick={handleAnalyze} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-full text-white shadow-lg">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                </button>
              </div>

              {result && (
                <div className="bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black">{result.product}</h3>
                    <div className="text-3xl font-black text-blue-600 px-6 py-4 bg-blue-50 dark:bg-blue-500/10 rounded-[28px]">{result.score}</div>
                  </div>
                  {/* Results list... (Warnings/Heroes mapping) */}
                </div>
              )}
            </div>
          )}

          {/* --- SETTINGS TAB (FULL ATTRIBUTES) --- */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black mb-6">Settings</h2>
              
              {/* Appearance */}
              <div className="bg-white dark:bg-[#1a1d23] p-6 rounded-[32px] mb-6 border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Appearance</h4>
                <div className="flex gap-2">
                  <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Sun size={18}/> Light</button>
                  <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-500/10 text-blue-400' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500'}`}><Moon size={18}/> Dark</button>
                </div>
              </div>

              {/* Comprehensive Profile */}
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
                      <p className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-white/80">{group.icon} {group.label}</p>
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

          {/* --- NAV SHELF --- */}
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