import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Type, 
  Settings, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  HelpCircle,
  Sparkles,
  Layers,
  Sliders,
  ChevronDown,
  FileText,
  AlignLeft,
  ArrowUp,
  ArrowDown,
  VolumeX,
  Plus,
  Minus,
  Camera,
  Upload,
  Loader2,
  X
} from 'lucide-react';
import { LIBRARY_PASSAGES } from '../data';
import { ReaderSettings, LibraryPassage } from '../types';

const ENCOURAGEMENT_MESSAGES = [
  "You showed up today — that's what matters.",
  "Reading is easier with practice, and you're practicing.",
  "Every bit you read counts, no matter the pace.",
  "Your dedication to practicing is wonderful to see.",
  "Every word you read today is a step forward.",
  "Taking your time is a beautiful way to learn.",
  "Consistency is about showing up, and you did that beautifully today.",
  "You are giving your mind a wonderful space to grow today."
];

function getTodayString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface StreakState {
  count: number;
  lastReadDate: string;
  isPaused: boolean;
  hasReadToday: boolean;
}

function getMilestoneBadge(count: number): { emoji: string; label: string; description: string } | null {
  if (count >= 30) {
    return { emoji: "🌸", label: "Deeply Rooted Reader", description: "30+ days of reading consistency" };
  }
  if (count >= 14) {
    return { emoji: "🌳", label: "Strong reader", description: "14+ days of reading consistency" };
  }
  if (count >= 7) {
    return { emoji: "🌿", label: "Building the habit", description: "7+ days of reading consistency" };
  }
  if (count >= 3) {
    return { emoji: "🌱", label: "Getting started", description: "3+ days of reading consistency" };
  }
  return null;
}

interface ReaderProps {
  initialPresetId?: string;
  screenerScore?: number | null;
}

// Simple English syllable counter and division algorithm for primary reading assistance
function splitSyllables(word: string): string {
  // Clean raw punctuation
  const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
  if (cleanWord.length <= 3) return word;

  // Standard simple rule-based syllable division
  const vowels = "aeiouyAEIOUY";
  const wordLower = cleanWord.toLowerCase();
  
  // Custom dictionary exceptions for common complex words
  const dict: { [key: string]: string } = {
    "something": "some-thing",
    "understanding": "un-der-stand-ing",
    "difficulty": "dif-fi-cul-ty",
    "evaluation": "e-val-u-a-tion",
    "learning": "learn-ing",
    "spelling": "spell-ing",
    "phonics": "phon-ics",
    "slowly": "slow-ly",
    "problems": "prob-lems",
    "assistance": "as-sis-tance",
    "optimizing": "op-ti-miz-ing",
    "readability": "read-a-bil-i-ty",
    "schoolwork": "school-work",
    "children": "chil-dren",
    "panchatantra": "Pan-cha-tan-tra",
    "chandrayaan": "Chan-dra-yaan",
    "organisation": "or-gan-i-sa-tion",
    "composition": "com-po-si-tion",
    "scientific": "sci-en-tif-ic",
    "vocabulary": "vo-cab-u-la-ry"
  };

  if (dict[wordLower]) {
    // Restore original capitalization if possible
    return dict[wordLower];
  }

  // Simple phonetic vowel division approximation
  let result = "";
  let vCount = 0;
  for (let i = 0; i < cleanWord.length; i++) {
    const char = cleanWord[i];
    result += char;
    
    const isVowel = vowels.includes(char);
    const nextCharIsVowel = i + 1 < cleanWord.length && vowels.includes(cleanWord[i + 1]);
    
    // Add hyphens after vowel clusters followed by consonants
    if (isVowel && !nextCharIsVowel && i < cleanWord.length - 2 && vCount < 2) {
      // Check if next char is double consonant
      const nextChar = cleanWord[i + 1];
      const nextNextChar = cleanWord[i + 2];
      if (nextChar === nextNextChar && nextChar !== ' ') {
        result += nextChar + "-";
        i++; // skip next char
      } else {
        result += "-";
      }
      vCount = 0;
    }
  }

  // Trim trailing/leading hyphens
  return result.replace(/^-|-$/g, "").replace(/--/g, "-");
}

export default function Reader({ initialPresetId, screenerScore }: ReaderProps) {
  // Default Reader Settings, customized dynamically if they had a high/mid screener score
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: screenerScore && screenerScore >= 16 ? 24 : 20,
    letterSpacing: screenerScore && screenerScore >= 12 ? 'extra' : 'wide',
    wordSpacing: screenerScore && screenerScore >= 12 ? 'extra' : 'wide',
    lineHeight: screenerScore && screenerScore >= 8 ? 'relaxed' : 'normal',
    fontFamily: 'lexend',
    theme: 'cream',
    overlayOpacity: 0.1,
    focusRuler: true,
    focusRulerHeight: 'medium',
    focusRulerColor: 'yellow',
    syllableHighlight: 'none',
    speechRate: 0.85 // child friendly slow speed
  });

  // Library & Reading texts state
  const [activePassageId, setActivePassageId] = useState<string>(
    initialPresetId || LIBRARY_PASSAGES[0].id
  );
  const [customText, setCustomText] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'library' | 'paste'>('library');

  // Camera & Image OCR States
  const [isCameraPanelOpen, setIsCameraPanelOpen] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Text-To-Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Interactive popup helper for clicked words (Phonic division)
  const [clickedWord, setClickedWord] = useState<{
    word: string;
    syllables: string;
    top: number;
    left: number;
  } | null>(null);

  // Reading Ruler tracking state
  const [rulerTop, setRulerTop] = useState<number>(120);
  const readingAreaRef = useRef<HTMLDivElement>(null);
  const clickedWordTimeoutRef = useRef<number | null>(null);

  // Streak tracking states
  const [streak, setStreak] = useState<StreakState>({
    count: 0,
    lastReadDate: '',
    isPaused: false,
    hasReadToday: false
  });
  const [encouragement, setEncouragement] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  useEffect(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const saved = localStorage.getItem('scribl_reading_streak');
    let currentStreak = { count: 0, lastReadDate: '', isPaused: false, hasReadToday: false };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const count = typeof parsed.count === 'number' ? parsed.count : 0;
        const lastReadDate = parsed.lastReadDate || '';
        const savedEncouragement = parsed.encouragement || '';
        
        let isPaused = false;
        let hasReadToday = false;
        
        if (lastReadDate === today) {
          hasReadToday = true;
        } else if (lastReadDate === yesterday) {
          hasReadToday = false;
        } else if (lastReadDate !== '') {
          isPaused = count > 0;
          hasReadToday = false;
        }
        
        currentStreak = {
          count,
          lastReadDate,
          isPaused,
          hasReadToday
        };

        if (hasReadToday && savedEncouragement) {
          setEncouragement(savedEncouragement);
          setShowCelebration(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setStreak(currentStreak);
  }, []);

  const triggerRead = (explicit: boolean = false) => {
    const today = getTodayString();
    
    setStreak(prev => {
      if (prev.hasReadToday) {
        if (explicit) {
          setShowCelebration(true);
        }
        return prev;
      }
      
      const newCount = prev.count + 1;
      
      const randIndex = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
      const selectedMsg = ENCOURAGEMENT_MESSAGES[randIndex];
      
      const nextStreak = {
        count: newCount,
        lastReadDate: today,
        isPaused: false,
        hasReadToday: true
      };
      
      localStorage.setItem('scribl_reading_streak', JSON.stringify({
        count: newCount,
        lastReadDate: today,
        encouragement: selectedMsg
      }));
      
      setEncouragement(selectedMsg);
      setShowCelebration(true);
      
      return nextStreak;
    });
  };

  const activePassage = LIBRARY_PASSAGES.find(p => p.id === activePassageId) || LIBRARY_PASSAGES[0];
  const milestone = getMilestoneBadge(streak.count);
  const readingText = isCustomMode ? customText || "Please paste your school homework or story in the text-area tab above." : activePassage.content;

  // SpeechSynthesis Utterance ref to cancel/handle changes
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Parse text into logical words list with original spacing boundaries to allow highlighting
  const [wordsList, setWordsList] = useState<{ index: number; word: string; cleanWord: string; start: number; end: number }[]>([]);

  useEffect(() => {
    // Build precise offsets whenever reading text changes
    const segments = readingText.split(/(\s+)/);
    let cumulativeLength = 0;
    const list: typeof wordsList = [];
    let wordIdx = 0;

    segments.forEach((segment) => {
      const start = cumulativeLength;
      const end = cumulativeLength + segment.length;
      if (segment.trim().length > 0) {
        list.push({
          index: wordIdx,
          word: segment,
          cleanWord: segment.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ""),
          start,
          end
        });
        wordIdx++;
      }
      cumulativeLength += segment.length;
    });

    setWordsList(list);
    setCurrentWordIndex(null);
    stopSpeech();
  }, [readingText]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
        
        // Try finding a clean English India (or standard English child/female) voice if possible
        const indVoice = allVoices.find(v => v.lang.includes('en-IN')) || 
                         allVoices.find(v => v.lang.includes('en-US')) || 
                         allVoices.find(v => v.lang.includes('en'));
        if (indVoice) {
          setSelectedVoiceName(indVoice.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Text spacing class builders
  const getLetterSpacingClass = () => {
    switch (settings.letterSpacing) {
      case 'normal': return 'tracking-normal';
      case 'wide': return 'tracking-[0.08em]';
      case 'extra': return 'tracking-[0.16em]';
      case 'double': return 'tracking-[0.24em]';
    }
  };

  const getWordSpacingClass = () => {
    switch (settings.wordSpacing) {
      case 'normal': return '';
      case 'wide': return 'font-normal [word-spacing:0.18em]';
      case 'extra': return 'font-normal [word-spacing:0.32em]';
      case 'double': return 'font-normal [word-spacing:0.48em]';
    }
  };

  const getLineHeightClass = () => {
    switch (settings.lineHeight) {
      case 'normal': return 'leading-normal';
      case 'relaxed': return 'leading-[2.0]';
      case 'loose': return 'leading-[2.5]';
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'lexend': return 'font-lexend';
      case 'comic': return 'font-comic';
      case 'inter': return 'font-inter';
      case 'mono': return 'font-mono';
      case 'opendyslexic': return 'font-opendyslexic';
      case 'atkinson': return 'font-atkinson';
    }
  };

  const getThemeClass = () => {
    switch (settings.theme) {
      case 'white': return 'bg-white text-slate-800 border-slate-200';
      case 'cream': return 'overlay-cream text-slate-800 border-amber-100';
      case 'yellow': return 'overlay-yellow text-amber-950 border-yellow-100';
      case 'peach': return 'overlay-peach text-amber-950 border-orange-100';
      case 'mint': return 'overlay-mint text-emerald-950 border-emerald-100';
      case 'blue': return 'overlay-blue text-sky-950 border-sky-100';
      case 'charcoal': return 'overlay-charcoal text-slate-200 border-slate-700';
    }
  };

  const getRulerHeight = () => {
    switch (settings.focusRulerHeight) {
      case 'narrow': return 'h-6';
      case 'medium': return 'h-12';
      case 'wide': return 'h-20';
    }
  };

  const getRulerColor = () => {
    switch (settings.focusRulerColor) {
      case 'yellow': return 'bg-yellow-200/40 border-y border-yellow-400/50 shadow-xs';
      case 'blue': return 'bg-sky-200/40 border-y border-sky-400/50 shadow-xs';
      case 'gray': return 'bg-slate-300/30 border-y border-slate-400/40 shadow-xs';
      case 'pink': return 'bg-pink-200/40 border-y border-pink-400/50 shadow-xs';
    }
  };

  // Text-To-Speech controls
  const speakText = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    synthRef.current.cancel();

    // Start a fresh voice uttrance
    const utterance = new SpeechSynthesisUtterance(readingText);
    utteranceRef.current = utterance;
    
    // Configure Voice rate and selection
    utterance.rate = settings.speechRate;
    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        // Search through wordsList offsets to locate the active word
        const activeWord = wordsList.find(w => charIdx >= w.start && charIdx <= w.end);
        if (activeWord) {
          setCurrentWordIndex(activeWord.index);
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    triggerRead(false);
    synthRef.current.speak(utterance);
  };

  const pauseSpeech = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    }
  };

  // Word interactions: speak slow phonetic syllable + display syllables dividing helper
  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, wordData: typeof wordsList[0]) => {
    // If TTS is currently speaking, don't interrupt with slow pronunciations
    if (isSpeaking && !isPaused) return;

    // Clear previous timeouts
    if (clickedWordTimeoutRef.current) {
      window.clearTimeout(clickedWordTimeoutRef.current);
    }

    // Sound out slowly
    if (synthRef.current) {
      synthRef.current.cancel();
      const wordUtterance = new SpeechSynthesisUtterance(wordData.cleanWord);
      wordUtterance.rate = 0.55; // Extremely slow for phonic blending
      const selectedVoice = voices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) {
        wordUtterance.voice = selectedVoice;
      }
      synthRef.current.speak(wordUtterance);
    }

    triggerRead(false);

    // Get click bounds to display the syllabic helper bubble
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const parentRect = readingAreaRef.current?.getBoundingClientRect();

    if (parentRect) {
      const top = rect.top - parentRect.top - 46; // Position slightly above the word
      const left = rect.left - parentRect.left + (rect.width / 2);
      
      const syllables = splitSyllables(wordData.word);
      setClickedWord({
        word: wordData.word,
        syllables: syllables,
        top,
        left
      });

      // Clear the syllable division help popup automatically after 3.5 seconds
      clickedWordTimeoutRef.current = window.setTimeout(() => {
        setClickedWord(null);
      }, 3500);
    }
  };

  // Drag/Track focus ruler inside the container
  const handleReadingAreaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.focusRuler) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    
    // Offset slightly so ruler is centered around cursor height
    setRulerTop(relativeY - 24);
  };

  // Camera, Scanner & OCR Helpers
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      setOcrError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      // Give React a brief moment to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err: any) {
      console.error("Camera access failed", err);
      setOcrError("Could not access your camera. Please ensure permissions are granted or upload an image file instead.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const performOcr = async () => {
    if (!capturedImage) return;
    setIsOcrLoading(true);
    setOcrError(null);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setCustomText(data.text);
        setIsCustomMode(true);
        // Log reading effort as a beautiful session practice!
        triggerRead(true);
        // Clean up
        setCapturedImage(null);
        setIsCameraPanelOpen(false);
      } else {
        setOcrError(data.error || "Failed to recognize text from the image.");
      }
    } catch (err: any) {
      setOcrError("Server connection failed. Please verify your internet connection and try again.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const moveRulerUp = () => {
    setRulerTop(prev => Math.max(0, prev - 35));
  };

  const moveRulerDown = () => {
    setRulerTop(prev => prev + 35);
  };

  const loadCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      setIsCustomMode(true);
    }
  };

  const isDyslexicGroupActive = settings.fontFamily === 'opendyslexic' || settings.fontFamily === 'atkinson';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-5">
      
      {/* PRIVATE STREAK STATUS & FROZEN BANNER (Full-width for extreme visibility) */}
      <div className="flex flex-col gap-3.5 print:hidden">
        {streak.isPaused && (
          <motion.div 
            id="streak-paused-banner-top"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs"
          >
            <span className="text-base shrink-0 select-none">☕</span>
            <div className="text-amber-950 leading-normal">
              <strong className="font-semibold block font-lexend mb-0.5">You took a break — that's okay!</strong>
              Your streak is paused, not lost. Come back anytime. Practice today to resume your journey from day {streak.count}!
            </div>
          </motion.div>
        )}

        <div id="private-streak-badge-top" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/60 p-4 rounded-2xl shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {streak.count > 0 ? (
              <div id="streak-active-badge-top" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/80 border border-amber-200 text-amber-800 rounded-xl font-extrabold text-sm shadow-xs">
                <span>🔥</span>
                <span>{streak.count}-day reading streak!</span>
              </div>
            ) : (
              <div id="streak-empty-badge-top" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs">
                <span>✨</span>
                <span>Start your reading journey today!</span>
              </div>
            )}

            {milestone && (
              <div id="milestone-badge-top" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold text-xs shadow-xs" title={milestone.description}>
                <span>{milestone.emoji}</span>
                <span>{milestone.label}</span>
              </div>
            )}

            {encouragement && (
              <div id="streak-encouragement-msg" className="text-xs font-semibold text-slate-600 font-lexend italic bg-white/60 px-3 py-1 rounded-xl border border-slate-100">
                "{encouragement}"
              </div>
            )}
          </div>
          
          <div id="reading-session-status-top" className="text-[11px] font-extrabold font-mono text-teal-800 bg-teal-50/80 border border-teal-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            {streak.hasReadToday ? "✓ Reading Logged Today" : "Session in progress"}
          </div>
        </div>
      </div>

      {/* TWO-COLUMN BENTO-LIKE DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SOURCE & LIBRARY PICKER & CUSTOM PASTE (4-cols) */}
        <div className="lg:col-span-4 space-y-5 print:hidden">
          
          {/* Quick Library selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-800 font-lexend text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              1. Choose Text Source
            </h3>

            {/* Source tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                id="library-tab-btn"
                onClick={() => {
                  setActiveTab('library');
                  setIsCustomMode(false);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                  activeTab === 'library' && !isCustomMode
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                School Stories
              </button>
              <button
                id="paste-tab-btn"
                onClick={() => {
                  setActiveTab('paste');
                  setIsCustomMode(true);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                  activeTab === 'paste' || isCustomMode
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Paste Homework
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'library' && !isCustomMode ? (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2.5"
                >
                  {LIBRARY_PASSAGES.map((passage) => {
                    const isActive = activePassageId === passage.id && !isCustomMode;
                    return (
                      <button
                        id={`select-story-${passage.id}`}
                        key={passage.id}
                        onClick={() => {
                          setActivePassageId(passage.id);
                          setIsCustomMode(false);
                          setClickedWord(null);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                          isActive 
                            ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/20' 
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {passage.gradeLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {passage.source}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 font-lexend mt-1">
                          {passage.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {passage.description}
                        </p>
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.form
                  key="paste"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onSubmit={loadCustomText}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="custom-paste-area" className="block text-xs font-bold text-slate-500">
                      Standard school paragraphs:
                    </label>
                    <button
                      id="toggle-camera-ocr-btn"
                      type="button"
                      onClick={() => {
                        setIsCameraPanelOpen(!isCameraPanelOpen);
                        if (isCameraActive) {
                          stopCamera();
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-lg transition cursor-pointer select-none"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {isCameraPanelOpen ? "Close Camera" : "Scan textbook 📷"}
                    </button>
                  </div>

                  {/* COLLAPSIBLE CAMERA / UPLOAD SCANNER PANEL */}
                  <AnimatePresence>
                    {isCameraPanelOpen && (
                      <motion.div 
                        id="camera-ocr-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                            Book & Page Scanner
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCameraPanelOpen(false);
                              stopCamera();
                            }}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {ocrError && (
                          <div id="ocr-error-banner" className="p-2 text-[10px] leading-normal bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                            {ocrError}
                          </div>
                        )}

                        {!capturedImage ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Live Camera Option */}
                            <div className="border border-slate-200/60 rounded-xl bg-white p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[120px]">
                              {isCameraActive ? (
                                <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                                  <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-600 text-white rounded-full text-[10px] font-bold shadow-md hover:bg-teal-700 transition"
                                  >
                                    Capture Photo
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Camera className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-bold text-slate-700">Device Camera</h4>
                                    <p className="text-[9px] text-slate-400 max-w-[120px]">Snap photo of textbook page</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={startCamera}
                                    className="px-2.5 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[9px] font-bold transition"
                                  >
                                    Open Camera
                                  </button>
                                </>
                              )}
                            </div>

                            {/* File Upload Option */}
                            <div className="border border-slate-200/60 rounded-xl bg-white p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[120px] relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Upload className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-700">Upload Photo</h4>
                                <p className="text-[9px] text-slate-400 max-w-[120px]">Choose image from files</p>
                              </div>
                              <button
                                type="button"
                                className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[9px] font-bold pointer-events-none"
                              >
                                Browse Files
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="relative aspect-video max-h-[150px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                              <img 
                                src={capturedImage} 
                                alt="Captured textbook preview" 
                                className="h-full w-auto object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => setCapturedImage(null)}
                                className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full shadow-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCapturedImage(null);
                                  startCamera();
                                }}
                                className="flex-1 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition"
                              >
                                Re-take Photo
                              </button>
                              <button
                                type="button"
                                onClick={performOcr}
                                disabled={isOcrLoading}
                                className="flex-1 py-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-lg text-[10px] transition flex items-center justify-center gap-1"
                              >
                                {isOcrLoading ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Reading page...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 fill-white" />
                                    Read with Gemini ✨
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    id="custom-paste-area"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type, paste, or scan textbook pages to load reading guides..."
                    className="w-full h-36 px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-lexend"
                  />
                  <button
                    id="load-custom-text-btn"
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                  >
                    Load into Reading Assistant
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* VISUAL & TYPOGRAPHY bento controls (4-cols) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-800 font-lexend text-sm flex items-center gap-2 border-b border-slate-50 pb-2.5">
              <Settings className="w-4 h-4 text-teal-600" />
              2. Readability Controls
            </h3>

            {/* Typography Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Font Family</span>
              </div>
              
              {/* Specialized Font Toggle */}
              <div className="bg-slate-100/80 p-1 rounded-xl grid grid-cols-2 text-center text-[11px] select-none">
                <button
                  type="button"
                  id="font-group-standard"
                  onClick={() => setSettings(p => ({ ...p, fontFamily: 'lexend' }))}
                  className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    !isDyslexicGroupActive 
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Standard Fonts
                </button>
                <button
                  type="button"
                  id="font-group-dyslexic"
                  onClick={() => setSettings(p => ({ ...p, fontFamily: 'opendyslexic' }))}
                  className={`py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                    isDyslexicGroupActive 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>✨ Dyslexia-Friendly</span>
                </button>
              </div>

              {/* Grid of fonts depending on mode */}
              <div className="grid grid-cols-2 gap-1.5">
                {!isDyslexicGroupActive ? (
                  [
                    { id: 'lexend', name: 'Lexend', cls: 'font-lexend' },
                    { id: 'comic', name: 'Comic Rounded', cls: 'font-comic' },
                    { id: 'inter', name: 'Inter Clean', cls: 'font-inter' },
                    { id: 'mono', name: 'Mono Grid', cls: 'font-mono' }
                  ].map(f => (
                    <button
                      id={`font-family-${f.id}`}
                      key={f.id}
                      onClick={() => setSettings(p => ({ ...p, fontFamily: f.id as any }))}
                      className={`py-2 px-2 border rounded-lg text-xs font-semibold transition cursor-pointer ${
                        settings.fontFamily === f.id
                          ? 'bg-teal-50/70 border-teal-500 text-teal-900 ring-1 ring-teal-500/10 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={f.cls}>{f.name}</span>
                    </button>
                  ))
                ) : (
                  [
                    { id: 'opendyslexic', name: 'OpenDyslexic', cls: 'font-opendyslexic font-normal text-[15px]' },
                    { id: 'atkinson', name: 'Atkinson Legible', cls: 'font-atkinson font-semibold text-[14px]' }
                  ].map(f => (
                    <button
                      id={`font-family-${f.id}`}
                      key={f.id}
                      onClick={() => setSettings(p => ({ ...p, fontFamily: f.id as any }))}
                      className={`py-2 px-1 border rounded-lg transition cursor-pointer flex flex-col items-center justify-center text-center ${
                        settings.fontFamily === f.id
                          ? 'bg-teal-600 border-teal-600 text-white ring-1 ring-teal-500/10 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`${f.cls} block leading-none mb-1`}>Abc</span>
                      <span className="font-lexend block text-[9px] font-black tracking-tight">{f.name}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Informative description helper for Dyslexia Fonts */}
              {isDyslexicGroupActive && (
                <div className="bg-teal-50/40 border border-teal-100/50 rounded-xl p-2.5 text-[10px] text-teal-950 font-lexend space-y-1 mt-2">
                  <span className="font-black text-teal-800 block uppercase tracking-wider">Why these fonts work:</span>
                  {settings.fontFamily === 'opendyslexic' ? (
                    <p className="font-medium text-slate-600 leading-normal">
                      <strong>OpenDyslexic</strong> uses a high bottom-weight bias (weighted bottoms) to prevent letters from spinning, reflecting, or blending together.
                    </p>
                  ) : (
                    <p className="font-medium text-slate-600 leading-normal">
                      <strong>Atkinson Hyperlegible</strong> increases character distinction (e.g. differentiating 'l', '1', and 'I') so children don't mix up letter glyphs.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Font Size Adjuster */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Font Size</span>
                <span className="text-xs font-bold text-slate-600 font-mono">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="font-size-dec"
                  onClick={() => setSettings(p => ({ ...p, fontSize: Math.max(16, p.fontSize - 2) }))}
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="font-size-slider"
                  type="range"
                  min="16"
                  max="36"
                  value={settings.fontSize}
                  onChange={(e) => setSettings(p => ({ ...p, fontSize: parseInt(e.target.value) }))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <button
                  id="font-size-inc"
                  onClick={() => setSettings(p => ({ ...p, fontSize: Math.min(36, p.fontSize + 2) }))}
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Spacings Bento-style adjustments */}
            <div className="space-y-3.5 border-t border-slate-100 pt-3">
              {/* Letter Spacing */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Letter Spacing</span>
                <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                  {['normal', 'wide', 'extra', 'double'].map((spacing) => (
                    <button
                      id={`letter-spacing-${spacing}`}
                      key={spacing}
                      onClick={() => setSettings(p => ({ ...p, letterSpacing: spacing as any }))}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer capitalize ${
                        settings.letterSpacing === spacing
                          ? 'bg-white text-slate-800 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Spacing */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Word Spacing</span>
                <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                  {['normal', 'wide', 'extra', 'double'].map((spacing) => (
                    <button
                      id={`word-spacing-${spacing}`}
                      key={spacing}
                      onClick={() => setSettings(p => ({ ...p, wordSpacing: spacing as any }))}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer capitalize ${
                        settings.wordSpacing === spacing
                          ? 'bg-white text-slate-800 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Line Height</span>
                <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                  {[
                    { id: 'normal', label: '1.5x' },
                    { id: 'relaxed', label: '2.0x' },
                    { id: 'loose', label: '2.5x' }
                  ].map((lh) => (
                    <button
                      id={`line-height-${lh.id}`}
                      key={lh.id}
                      onClick={() => setSettings(p => ({ ...p, lineHeight: lh.id as any }))}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer uppercase ${
                        settings.lineHeight === lh.id
                          ? 'bg-white text-slate-800 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlays (Scotopic / Meares-Irlen) Color Filters */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Reading Color Overlays
              </span>
              <div className="flex flex-wrap gap-2 justify-between">
                {[
                  { id: 'cream', name: 'Cream', code: 'bg-[#fcf8f2] border-amber-200' },
                  { id: 'yellow', name: 'Yellow', code: 'bg-[#fefbeb] border-yellow-200' },
                  { id: 'peach', name: 'Peach', code: 'bg-[#fff5eb] border-orange-200' },
                  { id: 'mint', name: 'Mint', code: 'bg-[#f0fdf4] border-emerald-200' },
                  { id: 'blue', name: 'Sky', code: 'bg-[#f0f9ff] border-sky-200' },
                  { id: 'white', name: 'White', code: 'bg-white border-slate-200' },
                  { id: 'charcoal', name: 'Dark', code: 'bg-[#1e293b] border-slate-700' },
                ].map((t) => (
                  <button
                    id={`overlay-color-${t.id}`}
                    key={t.id}
                    title={t.name}
                    onClick={() => setSettings(p => ({ ...p, theme: t.id as any }))}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition ${t.code} ${
                      settings.theme === t.id ? 'scale-125 ring-2 ring-teal-500/30 ring-offset-2' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Focus Ruler Switcher */}
            <div className="space-y-3.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Horizontal Focus Guide (Ruler)</span>
                <button
                  id="focus-ruler-toggle"
                  onClick={() => setSettings(p => ({ ...p, focusRuler: !p.focusRuler }))}
                  className={`w-10 h-6 rounded-full transition relative cursor-pointer ${
                    settings.focusRuler ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.focusRuler ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {settings.focusRuler && (
                <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Ruler Height</span>
                    <select
                      id="focus-ruler-height"
                      value={settings.focusRulerHeight}
                      onChange={(e) => setSettings(p => ({ ...p, focusRulerHeight: e.target.value as any }))}
                      className="w-full p-1 text-xs bg-slate-50 border border-slate-200 rounded-md cursor-pointer"
                    >
                      <option value="narrow">Narrow (24px)</option>
                      <option value="medium">Medium (48px)</option>
                      <option value="wide">Wide (80px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Ruler Tint</span>
                    <select
                      id="focus-ruler-color"
                      value={settings.focusRulerColor}
                      onChange={(e) => setSettings(p => ({ ...p, focusRulerColor: e.target.value as any }))}
                      className="w-full p-1 text-xs bg-slate-50 border border-slate-200 rounded-md cursor-pointer"
                    >
                      <option value="yellow">Yellow Highlighter</option>
                      <option value="blue">Blue Sky</option>
                      <option value="pink">Pink Soft</option>
                      <option value="gray">Neutral Gray</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE READER CANVAS (8-cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TOP NARRATION / TEXT-TO-SPEECH CONTROLS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5 flex flex-col gap-4 print:hidden">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Play/Pause/Stop controllers */}
              <div className="flex items-center gap-2.5">
                {!isSpeaking && !isPaused ? (
                  <button
                    id="tts-play-btn"
                    onClick={speakText}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-xs hover:shadow-md select-none"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Read Aloud</span>
                  </button>
                ) : isPaused ? (
                  <button
                    id="tts-play-btn"
                    onClick={speakText}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-xs hover:shadow-md select-none"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    id="tts-pause-btn"
                    onClick={pauseSpeech}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-xs hover:shadow-md select-none"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </button>
                )}

                {(isSpeaking || isPaused) && (
                  <button
                    id="tts-stop-btn"
                    onClick={stopSpeech}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer flex items-center justify-center select-none"
                    title="Stop reading"
                  >
                    <Square className="w-4 h-4 fill-slate-600 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Status and Active Audio Feedback Equalizer */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600">
                {isSpeaking ? (
                  <>
                    <div className="flex items-center gap-0.5 h-3.5 w-6 select-none" title="Audio playing">
                      <span className="w-1 bg-teal-500 h-2.5 animate-bounce rounded-full" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                      <span className="w-1 bg-teal-500 h-3.5 animate-bounce rounded-full" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }} />
                      <span className="w-1 bg-teal-500 h-1.5 animate-bounce rounded-full" style={{ animationDelay: '0.5s', animationDuration: '0.5s' }} />
                      <span className="w-1 bg-teal-500 h-3 animate-bounce rounded-full" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
                    </div>
                    <span>Reading page aloud...</span>
                  </>
                ) : isPaused ? (
                  <>
                    <span className="text-amber-500 select-none">⏸</span>
                    <span>Speech paused</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 select-none">✨</span>
                    <span>Ready to read aloud</span>
                  </>
                )}

                {/* Progress ratio label */}
                {wordsList.length > 0 && (isSpeaking || isPaused || currentWordIndex !== null) && (
                  <span className="font-mono text-[10px] bg-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded-md">
                    {currentWordIndex !== null ? Math.min(currentWordIndex + 1, wordsList.length) : 0}/{wordsList.length} words
                  </span>
                )}
              </div>

              {/* Narration voice speed & selection */}
              <div className="flex items-center gap-3.5 flex-wrap">
                {/* Speech rate slider */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-600 mr-1.5">Speed:</span>
                    <select
                      id="tts-speed-select"
                      value={settings.speechRate}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value);
                        setSettings(p => ({ ...p, speechRate: newRate }));
                        if (isSpeaking) {
                          setTimeout(() => speakText(), 50);
                        }
                      }}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer font-bold font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                    >
                      <option value="0.6">0.6x (Phonics slow)</option>
                      <option value="0.75">0.75x (Steady pace)</option>
                      <option value="0.85">0.85x (Default child)</option>
                      <option value="1.0">1.0x (Normal)</option>
                    </select>
                  </div>
                </div>

                {/* Voices dropdown */}
                {voices.length > 0 && (
                  <div className="text-xs max-w-[180px]">
                    <select
                      id="tts-voice-select"
                      value={selectedVoiceName}
                      onChange={(e) => {
                        setSelectedVoiceName(e.target.value);
                        if (isSpeaking) {
                          setTimeout(() => speakText(), 50);
                        }
                      }}
                      className="p-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer truncate font-bold text-slate-600 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                    >
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Visual horizontal reading progress bar */}
            {wordsList.length > 0 && (isSpeaking || isPaused || currentWordIndex !== null) && (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner flex">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-300 rounded-full shadow-xs" 
                  style={{ width: `${wordsList.length > 0 ? Math.round(((currentWordIndex !== null ? currentWordIndex : 0) / wordsList.length) * 100) : 0}%` }}
                />
              </div>
            )}

          </div>



          {/* MAIN READING AREA WITH OVERLAY THEME BACKGROUNDS */}
          <div className="relative">
            
            {/* Guide label block */}
            <div className="print:hidden absolute -top-3 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-slate-100 rounded-full text-[10px] font-bold shadow-xs">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Tip: Click any word to sound it out slowly!
            </div>

            {/* Mobile Ruler controllers */}
            {settings.focusRuler && (
              <div className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 print:hidden">
                <button
                  id="mobile-ruler-up"
                  onClick={moveRulerUp}
                  className="p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-900 transition shadow-lg"
                  title="Move ruler up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  id="mobile-ruler-down"
                  onClick={moveRulerDown}
                  className="p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-900 transition shadow-lg"
                  title="Move ruler down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reading Board Canvas Card */}
            <div
              id="reading-area-canvas"
              ref={readingAreaRef}
              onMouseMove={handleReadingAreaMouseMove}
              className={`w-full min-h-[500px] rounded-2xl border-2 p-6 sm:p-10 relative overflow-hidden transition-all duration-300 shadow-sm ${getThemeClass()} ${getFontFamilyClass()}`}
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              
              {/* Syllables popup overlay (Word division) */}
              <AnimatePresence>
                {clickedWord && (
                  <motion.div
                    key="popup"
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      top: `${clickedWord.top}px`,
                      left: `${clickedWord.left}px`,
                    }}
                    className="absolute -translate-x-1/2 z-30 bg-teal-600 text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-teal-500 text-xs text-center flex flex-col items-center justify-center font-lexend pointer-events-none font-bold"
                  >
                    <span className="text-[9px] text-teal-100 font-bold uppercase tracking-widest block mb-0.5">Syllables Sound-out</span>
                    <span className="text-sm font-extrabold tracking-wide">{clickedWord.syllables}</span>
                    {/* Tiny visual arrow pointing down */}
                    <div className="w-2.5 h-2.5 bg-teal-600 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Reading Line Ruler Overlay */}
              {settings.focusRuler && (
                <div 
                  className={`reading-ruler w-full left-0 ${getRulerHeight()} ${getRulerColor()}`}
                  style={{ top: `${rulerTop}px` }}
                />
              )}

              {/* Text Render Panel */}
              <div 
                className={`relative z-10 select-none select-text ${getLetterSpacingClass()} ${getWordSpacingClass()} ${getLineHeightClass()}`}
              >
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold font-lexend text-slate-800 border-b border-slate-200/50 pb-3 mb-6">
                  {isCustomMode ? "My Custom Lesson Page" : activePassage.title}
                </h2>

                {/* Splitting text by words list to map highlighters */}
                <div className="flex flex-wrap items-baseline gap-y-1">
                  {wordsList.map((wordData) => {
                    const isHighlighted = currentWordIndex === wordData.index;
                    
                    return (
                      <span
                        key={wordData.index}
                        onClick={(e) => handleWordClick(e, wordData)}
                        className={`inline-block transition cursor-pointer select-text rounded-sm px-0.5 ${
                          isHighlighted 
                            ? 'word-highlight' 
                            : 'hover:bg-teal-500/10 hover:text-teal-900 border-b border-transparent hover:border-teal-400'
                        }`}
                        style={{
                          marginRight: settings.wordSpacing === 'normal' ? '0.25em' : '0'
                        }}
                      >
                        {wordData.word}
                      </span>
                    );
                  })}
                </div>

              </div>

              {/* SAFE & COZY CELEBRATION BLOCK */}
              <AnimatePresence>
                {showCelebration && encouragement && (
                  <motion.div
                    id="cozy-celebration-block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-8 p-4 rounded-xl border border-teal-500/10 bg-teal-500/5 text-slate-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg text-teal-600 shrink-0 select-none">✨</div>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-teal-950 font-lexend">
                          {encouragement}
                        </p>
                        <p className="text-slate-500 leading-relaxed font-medium">
                          Every word you practice today builds a solid foundation for tomorrow. No comparisons, no timers — just beautiful effort.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOG SESSION BUTTON */}
              <div className="mt-8 pt-6 border-t border-slate-200/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="text-xs text-slate-500 font-lexend max-w-md text-center sm:text-left">
                  {streak.hasReadToday 
                    ? "Wonderful job reading today! You've successfully logged your practice session."
                    : "Finished your reading session? Let's log your beautiful effort for today."}
                </div>
                <button
                  id="done-reading-btn"
                  onClick={() => triggerRead(true)}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer select-none ${
                    streak.hasReadToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200/60'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-md'
                  }`}
                >
                  {streak.hasReadToday ? "✓ Reading Logged Today" : "Done Reading for Today!"}
                </button>
              </div>

            </div>

          </div>

          {/* ACCESSIBLE BOTTOM USER GUIDE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-700 block mb-1">How do I use this Assistant?</span>
              - **Select a Story**: Pick an age-appropriate lesson from the Indian school library preset list, or paste homework paragraphs directly into the text-area.<br />
              - **Visual Controls**: Select the <strong className="text-slate-700">Lexend</strong> font, increase letter and line spacing, and try warm background shades to eliminate visual letter crowding.<br />
              - **Sounding Out**: Click on any single word to hear it pronounced slowly, and view its child-friendly syllabic phonological division bubble.<br />
              - **Focus Ruler**: Move your cursor or finger over the reading board to glide the highlight ruler, keeping your eye focused strictly on the active sentence line.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
