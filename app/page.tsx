"use client";

import React, { useState } from 'react';
import { 
  Search, ShieldCheck, AlertTriangle, Sparkles, Loader2, 
  ChevronRight, ChevronLeft, CheckCircle2, User, Droplets, Wind
} from 'lucide-react';

export default function BaseLayer() {
  const [view, setView] = useState<'survey' | 'main'>('survey');
  const [surveyStep, setSurveyStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // The Master Profile State (Includes new Skin & Hair concerns)
  const [profile, setProfile] = useState({
    // Skin Types
    isOily: false, isDry: false, isCombination: false, isNormal: false,
    // Skin Concerns
    isSensitive: false, isAcneProne: false, isFungalAcne: false, 
    isRosacea: false, isEczema: false, isAging: false, 
    isHyperpigmentation: false, isDehydrated: false,
    isPoreCongested: false, isUnevenTexture: false, isFineLines: false, // NEW
    // Hair Types
    isStraight: false, isWavy: false, isCurly: false, isCoily: false,
    // Hair Concerns
    isThinning: false, isDryHair: false, isOilyScalp: false,
    isDandruff: false, isFrizz: false, isDamaged: false // NEW
  });

  const surveyData = [
    {
      title: "What's your skin type?",
      icon: <Droplets className="text-blue-500" />,
      options: [
        { label: "Oily", key: "isOily" },
        { label: "Dry", key: "isDry" },
        { label: "Combination", key: "isCombination" },
        { label: "Normal", key: "isNormal" }
      ]
    },
    {
      title: "Any specific skin concerns?",
      icon: <ShieldCheck className="text-indigo-500" />,
      options: [
        { label: "Sensitive", key: "isSensitive" },
        { label: "Acne Prone", key: "isAcneProne" },
        { label: "Fungal Acne", key: "isFungalAcne" },
        { label: "Rosacea", key: "isRosacea" },
        { label: "Eczema", key: "isEczema" },
        { label: "Hyperpigmentation", key: "isHyperpigmentation" },
        { label: "Dehydrated", key: "isDehydrated" },
        { label: "Pore Congestion", key: "isPoreCongested" },
        { label: "Uneven Texture", key: "isUnevenTexture" },
        { label: "Aging / Fine Lines", key: "isFineLines" }
      ]
    },
    {
      title: "Tell us about your hair",
      icon: <Wind className="text-purple-500" />,
      options: [
        { label: "Straight", key: "isStraight" },
        { label: "Wavy", key: "isWavy" },
        { label: "Curly", key: "isCurly" },
        { label: "Coily", key: "isCoily" },
        { label: "Thinning", key: "isThinning" },
        { label: "Dry Hair", key: "isDryHair" },
        { label: "Oily Scalp", key: "isOilyScalp" },
        { label: "Dandruff / Flaking", key: "isDandruff" },
        { label: "Frizz", key: "isFrizz" },
        { label: "Damage / Split Ends", key: "isDamaged" }
      ]
    }
  ];

  const toggleOption = (key: string) => {
    setProfile(prev => ({ ...prev, [key]: !prev[prev as keyof typeof profile] }));
  };

  const handleAnalyze = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setResult(null); // Clear previous results
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

  // --- SURVEY VIEW ---
  if (view === 'survey') {
    const currentStep = surveyData[surveyStep];
    return (
      // Added dark: classes to gracefully handle OS light/dark modes
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 shadow-xl dark:shadow-2xl dark:border dark:border-white/5 transition-colors">
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-1">
              {surveyData.map((_, i) => (
                <div key={i} className={`h-1 w-8 rounded-full ${i <= surveyStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">
              Step {surveyStep + 1}/3
            </span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">{currentStep.icon}</div>
            <h2 className="text-2xl font-bold">{currentStep.title}</h2>
          </div>

          {/* Scrollable Options List */}
          <div className="grid grid-cols-1 gap-3 mb-10 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {currentStep.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleOption(opt.key)}
                className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all ${
                  profile[opt.key as keyof typeof profile] 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span className="font-bold">{opt.label}</span>
                {profile[opt.key as keyof typeof profile] && <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {surveyStep > 0 && (
              <button 
                onClick={() => setSurveyStep(s => s - 1)} 
                className="flex-1 py-4 rounded-[24px] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
            )}
            <button 
              onClick={() => surveyStep < 2 ? setSurveyStep(s => s + 1) : setView('main')}
              className="flex-[2] py-4 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              {surveyStep < 2 ? "Continue" : "Finish Profile"} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] p-6 font-sans transition-colors pb-32">
      <div className="max-w-xl mx-auto pt-10">
        
        {/* Branding */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            BASE<span className="text-blue-600">LAYER</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Ingredient Intelligence</p>
        </header>

        {/* Search Input */}
        <div className="relative mb-12">
          <input
            type="text"
            placeholder="Search product or brand..."
            className="w-full p-6 pl-8 pr-20 rounded-[32px] bg-white dark:bg-[#1a1d23] text-slate-900 dark:text-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button 
            onClick={handleAnalyze}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{result.product}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-2 text-sm uppercase tracking-wide">
                  <User size={14} /> Profile Optimized
                </p>
              </div>
              <div className={`text-4xl font-black p-5 rounded-[24px] ${
                result.score > 70 ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 
                result.score > 40 ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 
                'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {result.score}
              </div>
            </div>

            {/* Warnings Section */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mb-8">
                <h4 className="text-red-600 dark:text-red-400 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} /> Profile Warnings
                </h4>
                <div className="space-y-3">
                  {result.warnings.map((warning: any, idx: number) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-100 dark:border-red-900/50">
                      <p className="font-bold text-red-900 dark:text-red-300">{warning.name}</p>
                      <p className="text-sm text-red-700 dark:text-red-400/80 mt-1">{warning.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Heroes Section */}
            {result.heroes && result.heroes.length > 0 && (
              <div>
                <h4 className="text-green-600 dark:text-green-400 font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} /> Beneficial Ingredients
                </h4>
                <div className="space-y-3">
                  {result.heroes.map((hero: any, idx: number) => (
                    <div key={idx} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-2xl border border-green-100 dark:border-green-900/50">
                      <p className="font-bold text-green-900 dark:text-green-300">{hero.name}</p>
                      <p className="text-sm text-green-700 dark:text-green-400/80 mt-1">{hero.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State / Neutral Product */}
            {result.warnings?.length === 0 && result.heroes?.length === 0 && (
              <div className="text-center p-6 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-500 dark:text-slate-400 font-medium">
                This product is neutral for your specific skin and hair profile.
              </div>
            )}
          </div>
        )}

        {/* Tab Bar Navigation */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1d23] p-3 px-8 rounded-full flex items-center gap-12 shadow-2xl z-50 border border-white/10">
           <button 
            onClick={() => setView('survey')} 
            className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1"
           >
             <ShieldCheck size={24} />
           </button>
           
           <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] relative -top-6 cursor-pointer hover:bg-blue-500 transition-colors">
             <Search size={24} />
           </div>
           
           <button className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1">
             <Sparkles size={24} />
           </button>
        </div>
        
      </div>
    </div>
  );
}