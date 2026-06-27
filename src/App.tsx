import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  BookOpen, 
  Sparkles, 
  Heart,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookmarkCheck,
  ChevronRight,
  HelpCircle,
  Sparkle,
  ArrowLeftRight
} from 'lucide-react';
import Screener from './components/Screener';
import Reader from './components/Reader';
import { ChildProfile, ScreenerRiskLevel } from './types';

export default function App() {
  // Navigation: 'screener' | 'reader'
  const [activeTab, setActiveTab] = useState<'screener' | 'reader'>('screener');
  
  // Screening performance state, synchronized with localStorage
  const [screenerScore, setScreenerScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<ScreenerRiskLevel | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [hasTakenTest, setHasTakenTest] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(0);

  // Load previous assessment data and streak from localStorage
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem('scribl_screener_score');
      const savedRisk = localStorage.getItem('scribl_screener_risk');
      const savedProfile = localStorage.getItem('scribl_child_profile');

      if (savedScore !== null && savedRisk !== null) {
        setScreenerScore(parseInt(savedScore));
        setRiskLevel(savedRisk as ScreenerRiskLevel);
        setHasTakenTest(true);
      }
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.error("Failed to load saved Scribl state", e);
    }
  }, []);

  // Sync and track reading streak
  useEffect(() => {
    const checkStreak = () => {
      try {
        const saved = localStorage.getItem('scribl_reading_streak');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.count === 'number') {
            setStreakCount(parsed.count);
          }
        } else {
          setStreakCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkStreak();

    // Listen to storage events and window focus to sync
    window.addEventListener('storage', checkStreak);
    const interval = setInterval(checkStreak, 1000); // quick poll for immediate UI updates
    return () => {
      window.removeEventListener('storage', checkStreak);
      clearInterval(interval);
    };
  }, [activeTab]);

  const handleScreenerCompletion = (score: number, risk: ScreenerRiskLevel, childProfile: ChildProfile) => {
    setScreenerScore(score);
    setRiskLevel(risk);
    setProfile(childProfile);
    setHasTakenTest(true);

    try {
      localStorage.setItem('scribl_screener_score', score.toString());
      localStorage.setItem('scribl_screener_risk', risk);
      localStorage.setItem('scribl_child_profile', JSON.stringify(childProfile));
    } catch (e) {
      console.error("Failed to save Scribl assessment", e);
    }
  };

  const navigateToReader = () => {
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToScreener = () => {
    setActiveTab('screener');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      
      {/* GLOBAL NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => setActiveTab('screener')}
            className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
          >
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-xs font-lexend">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-lexend">
              Scribl<span className="text-teal-500 text-2xl font-sans">.</span>
            </span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            <button
              id="nav-screener-tab"
              onClick={navigateToScreener}
              className={`inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'screener'
                  ? 'bg-white text-teal-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Screener
            </button>
            <button
              id="nav-reader-tab"
              onClick={navigateToReader}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-white text-teal-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reader Tool</span>
              {streakCount > 0 && (
                <span id="header-streak-badge" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-extrabold text-[10px] animate-bounce shrink-0" title={`${streakCount}-day reading streak!`}>
                  🔥 {streakCount}
                </span>
              )}
              {hasTakenTest && streakCount === 0 && (
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shrink-0" />
              )}
            </button>
          </nav>

          {/* User / Badge Info */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200/50 py-1.5 px-3.5 rounded-full text-xs">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-700">{profile.name}</span>
                <span className="text-slate-400 font-mono">({profile.grade})</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                Indian Schools Edition
              </div>
            )}
          </div>

        </div>
      </header>

      {/* BODY WORKSPACE */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* TAB 2: SCREENER FLOW */}
          {activeTab === 'screener' && (
            <motion.div
              key="screener-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Screener 
                onComplete={handleScreenerCompletion}
                savedScore={screenerScore}
                savedRiskLevel={riskLevel}
                savedProfile={profile}
                onNavigateToReader={navigateToReader}
              />
            </motion.div>
          )}

          {/* TAB 3: READER FLOW */}
          {activeTab === 'reader' && (
            <motion.div
              key="reader-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Bar */}
              <div className="w-full max-w-5xl mx-auto px-4 mb-4 print:hidden">
                <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 font-lexend">
                      {profile ? `Reader Profile: ${profile.name}` : "Dyslexia-Friendly Reader Panel"}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {hasTakenTest 
                        ? `Custom settings applied based on screening score: ${screenerScore}/24.` 
                        : "You can adjust the fonts, letter spacings, and overlays below to optimize text clarity."}
                    </p>
                  </div>
                  {!hasTakenTest && (
                    <button
                      id="reader-take-screener-btn"
                      onClick={navigateToScreener}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-teal-200 hover:border-teal-300 text-teal-700 bg-teal-50/50 rounded-lg text-xs font-bold transition cursor-pointer self-start sm:self-auto"
                    >
                      Take Screener Test First
                    </button>
                  )}
                </div>
              </div>

              <Reader 
                screenerScore={screenerScore}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 print:hidden text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <span className="font-bold text-slate-600 font-lexend block">Scribl Dyslexia Project</span>
            <span>Supporting child literacy, phonetic blend learning, and inclusive classrooms.</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center md:justify-end text-slate-300 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for inclusive classrooms in India</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
