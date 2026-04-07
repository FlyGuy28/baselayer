"use client";

import React, { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

export default function BaseLayer() {
  // --- 1. STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // User Profile State (Matches the flags in your lib/ingredientRules.ts)
  const [profile, setProfile] = useState({
    isOily: false,
    isDry: false,
    isSensitive: false,
    isAcneProne: false,
    isFungalAcne: false,
    isRosacea: false,
    isEczema: false,
    isAging: false,
    isHyperpigmentation: false,
    isDehydrated: false,
  });

  // --- 2. CORE LOGIC: API CALL ---
  const handleAnalyze = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: searchQuery,
          profile: profile, 
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResult(data);
      } else if (data.status === 'missing') {
        alert("Product not found. Try searching for a brand name like 'Avon' or use the manual scan!");
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Check your .env.local and Supabase connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. UI RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-indigo-600 mb-2">BaseLayer</h1>
          <p className="text-slate-500">Personalized Ingredient Intelligence</p>
        </header>

        {/* Profile Selector Section */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> Your Skin Profile
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(profile).map((key) => (
              <button
                key={key}
                onClick={() => setProfile(prev => ({ ...prev, [key]: !prev[key as keyof typeof profile] }))}
                className={`py-3 px-4 rounded-2xl text-sm font-medium transition-all border ${
                  profile[key as keyof typeof profile] 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </section>

        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search 17,914 products or enter barcode..."
            className="w-full p-5 pl-14 rounded-3xl bg-white border border-slate-200 shadow-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-2xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Analyze"}
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block p-4 bg-white rounded-full shadow-md animate-bounce mb-4">
              <Sparkles className="text-indigo-500" />
            </div>
            <p className="text-slate-500 font-medium italic">Cross-referencing ingredients...</p>
          </div>
        )}

        {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Score Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-1">{result.product}</h2>
                <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold">Compatibility Report</p>
                
                <div className="flex items-center gap-6">
                  <div className={`text-6xl font-black ${result.score > 75 ? 'text-green-500' : result.score > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {result.score}%
                  </div>
                  <div className="h-12 w-0.5 bg-slate-100" />
                  <p className="text-slate-600 font-medium max-w-50">
                    {result.score > 75 ? "Excellent match for your profile!" : result.score > 50 ? "Use with caution." : "Not recommended for your skin."}
                  </p>
                </div>
              </div>
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 ${result.score > 75 ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            {/* Heroes Grid */}
            {result.heroes.length > 0 && (
              <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                <h3 className="text-green-700 font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} /> Beneficial Ingredients
                </h3>
                <div className="space-y-3">
                  {result.heroes.map((hero: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="font-bold text-green-900">{hero.name}</p>
                      <p className="text-sm text-green-700">{hero.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings Grid */}
            {result.warnings.length > 0 && (
              <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                <h3 className="text-red-700 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} /> Potential Triggers
                </h3>
                <div className="space-y-3">
                  {result.warnings.map((warn: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="font-bold text-red-900">{warn.name}</p>
                      <p className="text-sm text-red-700">{warn.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}