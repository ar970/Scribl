import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  BookOpen, 
  RefreshCw, 
  HelpCircle,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  Info,
  Sparkle,
  ShieldCheck,
  Heart,
  Zap,
  ChevronRight
} from 'lucide-react';
import { SCREENER_QUESTIONS, RATING_LABELS } from '../data';
import { ScreenerRating, ScreenerResponse, ChildProfile, ScreenerRiskLevel } from '../types';

interface ScreenerProps {
  onComplete: (score: number, riskLevel: ScreenerRiskLevel, profile: ChildProfile) => void;
  savedScore: number | null;
  savedRiskLevel: ScreenerRiskLevel | null;
  savedProfile: ChildProfile | null;
  onNavigateToReader: (initialTextPreset?: string) => void;
}

export default function Screener({ 
  onComplete, 
  savedScore, 
  savedRiskLevel, 
  savedProfile,
  onNavigateToReader 
}: ScreenerProps) {
  // Screener flow state: 'setup' | 'questions' | 'result'
  const [step, setStep] = useState<'setup' | 'questions' | 'result'>(
    savedScore !== null ? 'result' : 'setup'
  );
  
  // Profile state
  const [profile, setProfile] = useState<ChildProfile>(
    savedProfile || { name: '', age: 8, grade: 'Grade 3' }
  );

  // Question answering state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ScreenerResponse>({});
  
  // Calculated results (for current run)
  const [score, setScore] = useState<number>(savedScore || 0);
  const [riskLevel, setRiskLevel] = useState<ScreenerRiskLevel>(savedRiskLevel || 'low');

  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: "What is the CLDQ-R screening scale?",
      a: "The Colorado Learning Disabilities Questionnaire – Reading Subscale (CLDQ-R) is a highly reliable research-backed screening scale. It evaluates 6 critical behavioral markers—including spelling, letters, phonics, and reading speed—to identify if a child is displaying traditional indicators of dyslexia. It is used as an early identifier before full clinical assessments."
    },
    {
      q: "Who is Scribl designed for?",
      a: "Scribl is custom-crafted for parents, school teachers, and reading tutors of children aged 6 to 14. This range corresponds to primary and upper primary school classes in India (Classes 1 through 8), where phonics instruction and textbook reading transition from basic decoding to active comprehension."
    },
    {
      q: "How do reading visual overlays and the ruler help?",
      a: "Many children with dyslexia struggle with 'crowding' (letters looking too close together) or 'visual stress' (Meares-Irlen syndrome) under harsh white lights. Custom soft pastel backgrounds (mint, cream, yellow), widened letter/word spacings, and the sliding highlight Focus Ruler prevent text lines from jumping or blending on the screen, improving child reading speed."
    },
    {
      q: "Is this a substitute for a medical or psychological diagnosis?",
      a: "No. Scribl is a preliminary screener to raise awareness and support. If several risk indicators are detected, we strongly encourage discussing these patterns with a child counselor, licensed educational psychologist, or school principal to set up formal assessments and school accommodations."
    }
  ];

  // Grades list used in Indian Schools
  const grades = [
    'Grade 1 (Class 1)',
    'Grade 2 (Class 2)',
    'Grade 3 (Class 3)',
    'Grade 4 (Class 4)',
    'Grade 5 (Class 5)',
    'Grade 6 (Class 6)',
    'Grade 7 (Class 7)',
    'Grade 8 (Class 8)',
    'Grade 9+',
  ];

  const handleStartScreener = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('questions');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleSelectRating = (rating: ScreenerRating) => {
    const qId = SCREENER_QUESTIONS[currentQuestionIndex].id;
    const updatedAnswers = { ...answers, [qId]: rating };
    setAnswers(updatedAnswers);

    // Auto-advance with short delay for tactile response feel
    setTimeout(() => {
      if (currentQuestionIndex < SCREENER_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Evaluate screener
        calculateResult(updatedAnswers);
      }
    }, 200);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResult = (finalAnswers: ScreenerResponse) => {
    let sum = 0;
    SCREENER_QUESTIONS.forEach(q => {
      sum += finalAnswers[q.id] || 0;
    });

    let level: ScreenerRiskLevel = 'low';
    if (sum >= 16) {
      level = 'high';
    } else if (sum >= 8) {
      level = 'mid';
    }

    setScore(sum);
    setRiskLevel(level);
    setStep('result');
    onComplete(sum, level, profile);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('setup');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper messages matching user prompt instructions
  const getRiskContent = (level: ScreenerRiskLevel) => {
    switch (level) {
      case 'low':
        return {
          title: "Minimal Risk Indicators",
          badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
          barColor: "bg-teal-500",
          textColor: "text-teal-900",
          bgLight: "bg-teal-50/50",
          text: "Minimal risk indicators. Reading disability seems unlikely based on this screener, but our reader tool can still help anyone read more easily."
        };
      case 'mid':
        return {
          title: "Moderate Risk Indicators",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
          barColor: "bg-amber-500",
          textColor: "text-amber-900",
          bgLight: "bg-amber-50/50",
          text: "Some risk indicators present, consistent with patterns sometimes seen in reading disability (dyslexia), which affects about 5% of people. We recommend discussing this with a teacher or school counselor."
        };
      case 'high':
        return {
          title: "Several Risk Indicators",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          barColor: "bg-indigo-500",
          textColor: "text-indigo-900",
          bgLight: "bg-indigo-50/50",
          text: "Several risk indicators present. We strongly recommend a formal evaluation with a school or licensed psychologist. In the meantime, here's our reader tool. This tool provides immediate support by optimizing text readability for those struggling."
        };
    }
  };

  const activeRisk = getRiskContent(step === 'result' ? riskLevel : 'low');

  // Specific recommendations based on individual high-scored questions
  const getTargetedRecommendations = () => {
    const list: string[] = [];
    if (step !== 'result') return list;

    if (answers[1] >= 2) {
      list.push("For Spelling: Use multi-sensory activities (like writing words in sand, building with plastic letter blocks, or tracing letters on paper while sounding them out).");
    }
    if (answers[2] >= 2) {
      list.push("For Letter Names: Use visual association cards with fun illustrations, and physical letter magnets to touch and feel character shapes.");
    }
    if (answers[3] >= 2) {
      list.push("For Phonics & Blending: Practice daily syllable clapping, rhyming games, and using soft-colored markers to split long words into small sound chunks.");
    }
    if (answers[4] >= 2 || answers[5] >= 2) {
      list.push("For Reading Fluency: Enable the 'Reading Ruler' in our Reader Tool to help track lines, increase line height to 2.0, and try the custom Lexend font.");
    }
    if (answers[6] >= 2) {
      list.push("School Accommodations: Request reading support sessions, extra time in exams, or audio recordings of textbook chapters from the child's teacher.");
    }

    // Default general guidelines if no specific high scores
    if (list.length === 0) {
      list.push("Daily Reading: Practice shared reading with parents or teachers for 10-15 minutes using engaging stories.");
      list.push("Interactive Tools: Try our specialized Reader Tool with double letter-spacing and soft pastel backgrounds to prevent visual fatigue.");
    }

    return list;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-4 sm:px-6">
      
      {/* HEADER SECTION - Always visible except when printing report */}
      <div className="print:hidden mb-8 text-center sm:text-left border-b border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-lexend flex items-center justify-center sm:justify-start gap-2">
              Scribl<span className="text-teal-500 text-5xl font-sans leading-none">.</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Dyslexia Screening & Reading Assistance for Indian Schools (Ages 6–14)
            </p>
          </div>
          {step === 'result' && (
            <button
              onClick={() => setStep('setup')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 bg-white rounded-lg text-sm font-medium transition cursor-pointer self-center sm:self-auto shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              New Screening Test
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: DEMOGRAPHIC SETUP AND HOME HUB */}
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-16 pb-12"
          >
            
            {/* SPLIT INTRO ROW: HERO PRESENTATION + PROFILE CREATION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cozy, targeted copy explaining the assessment and visual settings */}
              <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-bold">
                  <Sparkle className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Scribl Sensory & Cognitive Reading Assistant
                </div>

                {/* Friendly, compassionate display typography */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none font-lexend">
                  Understanding Your Child's Unique Reading Style
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Scribl provides a gentle, stress-free screening workspace to evaluate phonics and behavioral markers. By recognizing individual needs, we immediately suggest optimal visual overlays, font settings, and customized focusing rulers to make reading feel effortless.
                </p>

                {/* Right Column Visual Image Card framed elegantly like the reference */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-teal-500 rounded-3xl blur-md opacity-25" />
                  <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden transform lg:-rotate-1 hover:rotate-0 transition duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&h=750&q=80"
                      alt="Warm cozy supportive learning environment with parent and child smiling happily"
                      className="w-full h-auto object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    {/* Overlay caption bubble */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-100 shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-xs font-bold">
                          ★
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">Safe & Encouraging Workspace</span>
                          <span className="text-slate-500">No strict timers or pressure. We help every unique mind thrive at its own pace.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indian classrooms statistics indicator */}
                <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    CLDQ-R Validated Standard
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Heart className="w-3.5 h-3.5 text-teal-600" />
                    Bilingual Reading Modes
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    Primary & Middle School Range
                  </div>
                </div>

              </div>

              {/* Right Column: Demographics & Test Form Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold mb-3">
                    <Info className="w-3.5 h-3.5" />
                    Validated Research Screener (CLDQ-R)
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-lexend tracking-tight mb-2">
                    Welcome to Scribl.
                  </h2>
                  
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Based on the <strong className="text-slate-900">Colorado Learning Disabilities Questionnaire – Reading Subscale (CLDQ-R)</strong>, a validated research screener. This is not a medical diagnosis — please consult a school or specialist for a full evaluation.
                  </p>
                </div>

                {/* Informative help box */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 flex items-start gap-3">
                  <div className="bg-slate-200 p-2 rounded-lg text-slate-600 shrink-0 hidden sm:block">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800 block mb-0.5">Who should complete this?</span>
                    This questionnaire is designed for parents, teachers, or primary caregivers of children aged 6 to 14. Please rate the child's typical performance over the past six months.
                  </div>
                </div>

                {/* SETUP FORM */}
                <form onSubmit={handleStartScreener} className="space-y-4 border-t border-slate-100 pt-5">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-500" />
                    Child Profile Information
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Name field */}
                    <div>
                      <label htmlFor="student-name" className="block text-xs font-semibold text-slate-600 mb-1">
                        Child Name / Initial
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        placeholder="e.g. Aarav"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Age field */}
                      <div>
                        <label htmlFor="student-age" className="block text-xs font-semibold text-slate-600 mb-1">
                          Age (Years)
                        </label>
                        <input
                          id="student-age"
                          type="number"
                          min="6"
                          max="14"
                          value={profile.age}
                          onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 8 }))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                          required
                        />
                      </div>

                      {/* Grade field */}
                      <div>
                        <label htmlFor="student-grade" className="block text-xs font-semibold text-slate-600 mb-1">
                          School Grade
                        </label>
                        <select
                          id="student-grade"
                          value={profile.grade}
                          onChange={(e) => setProfile(prev => ({ ...prev, grade: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
                        >
                          {grades.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      id="start-screening-btn"
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Start Screening Test
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              </div>

            </div>

            {/* THREE-COLUMN BENTO CORE VALUE PROPOSITIONS */}
            <section className="pt-4">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold font-lexend tracking-tight text-slate-900">
                  Dual Action Screening & Assistance
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Scribl bridges the gap between clinical research and direct, immediately accessible screen accommodations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-lexend">
                    Research-Backed Screener
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    Scribl implements the 6 core reading-subscale parameters of the validated Colorado Learning Disabilities Questionnaire (CLDQ-R) to map early indicators without causing testing anxiety.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600">
                    Included Below
                  </span>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-lexend">
                    Dyslexia-Optimized Font
                    <span className="ml-2 text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full font-mono">Lexend</span>
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    Equipped with <strong>Lexend</strong>, a font scientifically proven to reduce spacing stress and letter crowding, coupled with spacious double tracking to prevent lines from collapsing together.
                  </p>
                  <button 
                    onClick={() => onNavigateToReader()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer pt-1"
                  >
                    Try Reader Tool <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-lexend">
                    Tactile Line Guide
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    Includes an interactive visual Reading Overlay ruler that tracks mouse and finger motions. Tinted in warm yellow, blue, or pink, it keeps the child's focus strictly centered on one line of text.
                  </p>
                  <button 
                    onClick={() => onNavigateToReader()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-1"
                  >
                    Activate Overlays <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </section>

            {/* SCIENTIFIC COMPARISON BLOCK */}
            <section className="bg-slate-900 text-white py-12 px-6 rounded-3xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left explanation */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block">Visual crowdedness vs visual space</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-lexend leading-tight">
                    Why Normal Text Formats Cause Fatigue
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Conventional school textbooks are printed in tight, high-contrast black serif fonts on bright white paper. For a child with dyslexia, letters can seem to rotate, merge, or 'dance' on the page. 
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Scribl relaxes the eyes by utilizing pastel filters (cream or mint) and wider spacing so each syllable stands out individually.
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigateToReader()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer"
                    >
                      View Indian School Presets Library <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right side interactive mock visual comparison card */}
                <div className="lg:col-span-7 bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">
                  <span className="text-xs font-mono text-slate-500 block uppercase tracking-widest text-center border-b border-slate-700 pb-2">Aesthetic Readability Comparison</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Standard text bad mock */}
                    <div className="bg-white text-slate-900 p-4 rounded-xl space-y-2 select-none opacity-85">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Standard Paper Format (Stressful)</span>
                      <p className="font-sans text-xs text-justify leading-tight tracking-normal">
                        Once,onahotsummerday,athirstycrowflewalloverthefieldslookingforwater.Foralongtime,hecouldnotfindany.Hefeltveryweakandtired.
                      </p>
                      <span className="block text-[9px] text-slate-400">Letters crowded, high-contrast glare.</span>
                    </div>

                    {/* Scribl optimized mock */}
                    <div className="bg-[#fcf8f2] text-amber-950 p-4 rounded-xl space-y-2 border border-amber-100 select-none">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Scribl Accommodations (Calm)</span>
                      <p className="font-lexend text-xs leading-relaxed tracking-wider">
                        Once , on a hot sum-mer day , a thirs-ty crow flew looking for wa-ter .
                      </p>
                      <span className="block text-[9px] text-teal-600 font-semibold">Lexend font, syllable hyphenation division, cream overlay.</span>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS SECTION */}
            <section className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold font-lexend text-slate-900">
                  Frequently Asked Questions
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Understanding reading differences and how Scribl can assist teachers and parents in India.
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = faqOpen === index;
                  return (
                    <div 
                      key={index} 
                      className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs transition"
                    >
                      <button
                        id={`faq-toggle-${index}`}
                        onClick={() => toggleFaq(index)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-800 text-sm sm:text-base cursor-pointer hover:bg-slate-50/40"
                        type="button"
                      >
                        <span className="font-lexend text-xs sm:text-sm">{faq.q}</span>
                        <span className={`text-teal-500 font-bold transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                          ➔
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-5 sm:px-5 sm:pb-6 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-50 pt-3">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* INDIAN CLASSROOM SUPPORT ACCREDITATION BOX */}
            <section className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100/60 rounded-3xl p-6 sm:p-10 text-center space-y-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                🇮🇳
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800 font-lexend">
                Supporting Inclusive Education in India
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                Consistent with the National Education Policy (NEP) guidelines for inclusive classrooms and early intervention for students with Specific Learning Disabilities, Scribl is provided completely free of charge to help Indian primary educators support students easily in English reading periods.
              </p>
            </section>

          </motion.div>
        )}

        {/* STEP 2: ACTIVE QUESTION FLOW */}
        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8"
          >
            {/* Progress Indicators */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className="flex items-center gap-1 text-slate-500">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
                  Screener for {profile.name || "Student"} ({profile.grade})
                </span>
                <span>Question {currentQuestionIndex + 1} of 6</span>
              </div>
              
              {/* Progress Bar container */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question Block */}
            <div className="min-h-[280px] flex flex-col justify-between py-2">
              <div>
                {/* Question Text */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-lexend tracking-tight leading-snug mb-3">
                  {SCREENER_QUESTIONS[currentQuestionIndex].text}
                </h3>
                
                {/* Question Subtext */}
                {SCREENER_QUESTIONS[currentQuestionIndex].subtext && (
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6 border-l-2 border-teal-200 pl-3">
                    {SCREENER_QUESTIONS[currentQuestionIndex].subtext}
                  </p>
                )}
              </div>

              {/* 5-Point Rating Grid */}
              <div className="space-y-3 my-6">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select the frequency:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {Object.keys(RATING_LABELS).map((scoreVal) => {
                    const ratingInt = parseInt(scoreVal) as ScreenerRating;
                    const details = RATING_LABELS[ratingInt];
                    const questionId = SCREENER_QUESTIONS[currentQuestionIndex].id;
                    const isSelected = answers[questionId] === ratingInt;

                    return (
                      <button
                        id={`rate-q${questionId}-${ratingInt}`}
                        key={scoreVal}
                        type="button"
                        onClick={() => handleSelectRating(ratingInt)}
                        className={`p-4 rounded-xl text-left sm:text-center border-2 transition-all cursor-pointer flex sm:flex-col justify-between sm:justify-center items-center gap-2 ${
                          isSelected 
                            ? 'bg-teal-50/70 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500/20' 
                            : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {/* Rating Number Bubble */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                          isSelected 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ratingInt}
                        </div>
                        
                        {/* Rating Descriptions */}
                        <div className="text-left sm:text-center shrink">
                          <span className="block text-sm font-semibold leading-tight">
                            {details.label.split(' / ')[0]}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-normal leading-normal sm:mt-0.5">
                            {details.label.split(' / ')[1] || details.desc}
                          </span>
                        </div>

                        {/* Mobile selection indicator */}
                        <div className="block sm:hidden">
                          {isSelected && <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
                <button
                  id="screener-prev-btn"
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentQuestionIndex === 0
                      ? 'opacity-30 cursor-not-allowed text-slate-300 bg-slate-50'
                      : 'text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <span className="text-xs font-semibold text-slate-400 font-mono">
                  CLDQ-R Scale
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SCREENER RESULT PAGE */}
        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Calm non-alarming result header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Score Circular Dial (Calm, Elegant) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      {/* Active Circle with calming colors based on risk */}
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke={
                          riskLevel === 'low' 
                            ? '#0d9488' // Teal-600
                            : riskLevel === 'mid' 
                              ? '#d97706' // Amber-600
                              : '#4f46e5' // Indigo-600
                        }
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - score / 24)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Score Labels Inside Dial */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold font-lexend text-slate-800">
                        {score}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 mt-0.5">
                        Max Score 24
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 px-3 py-1 border rounded-full text-xs font-semibold tracking-wide ${activeRisk?.badgeColor}`}>
                    {activeRisk?.title}
                  </div>
                </div>

                {/* Score Text Explanation */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      Screening Assessment For
                    </span>
                    <h3 className="text-2xl font-bold text-slate-800 font-lexend mt-0.5">
                      {profile.name || "Student"} (Age {profile.age} • {profile.grade})
                    </h3>
                  </div>

                  {/* Designated statement from user prompt */}
                  <div className={`p-5 rounded-xl border border-slate-100/80 leading-relaxed text-sm sm:text-base ${activeRisk?.textColor} ${activeRisk?.bgLight}`}>
                    {activeRisk?.text}
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    * The Colorado Learning Disabilities Questionnaire – Reading Subscale scores range from 0 to 24. Higher scores represent more correlated indicators often seen in formal dyslexia evaluations.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION SECTION - Reader Tool CTA */}
            <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/5 rounded-2xl border border-teal-100/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Custom Pre-Configured
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 font-lexend">
                    Dyslexia-Friendly Reading Assistant
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Our customized reader tool instantly renders text using the highly legible **Lexend** font with adjusted letter-spacing, line height, and a colored reading ruler to support children with phonics and reading fluency.
                  </p>
                </div>
                <button
                  id="open-reader-assistant-btn"
                  onClick={() => onNavigateToReader()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition hover:shadow-md cursor-pointer shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  Open Reading Assistant
                </button>
              </div>
            </div>

            {/* PRINT-FRIENDLY DETAILED EVALUATION REPORT CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h4 className="text-base sm:text-lg font-bold text-slate-800 font-lexend flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  Screener Detail & Guidance Sheet
                </h4>
                <button
                  id="print-report-btn"
                  onClick={handlePrint}
                  className="print:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>

              {/* REPORT CARD FOR TEACHERS/PSYCHOLOGISTS */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">Student Name</span>
                    <span className="text-sm font-semibold text-slate-800">{profile.name || "Student"}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">Age / Class</span>
                    <span className="text-sm font-semibold text-slate-800">{profile.age} Yrs • {profile.grade}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total CLDQ-R Score</span>
                    <span className="text-sm font-extrabold text-slate-800">{score} / 24</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">Risk Category</span>
                    <span className="text-sm font-extrabold text-teal-600">{activeRisk?.title}</span>
                  </div>
                </div>

                {/* Question Score Breakdown */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Question Response Details
                  </h5>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white text-xs sm:text-sm">
                    {SCREENER_QUESTIONS.map((q) => {
                      const ansVal = answers[q.id] !== undefined ? answers[q.id] : 0;
                      const ratingInfo = RATING_LABELS[ansVal as ScreenerRating];
                      
                      return (
                        <div key={q.id} className="p-3.5 sm:grid sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-8 space-y-0.5">
                            <span className="font-semibold text-slate-800 block">
                              {q.id}. {q.text}
                            </span>
                          </div>
                          <div className="sm:col-span-4 mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-3">
                            <span className="text-xs text-slate-400 font-medium">Rating: {ansVal}/4</span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                              ansVal >= 3 
                                ? 'bg-indigo-50 text-indigo-700' 
                                : ansVal >= 2 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-slate-50 text-slate-600'
                            }`}>
                              {ratingInfo ? ratingInfo.label.split(' / ')[0] : 'Never'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Educational Recommendations Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    Recommended Remedial Strategies for School & Home
                  </h5>
                  <div className="bg-teal-50/20 border border-teal-100/50 rounded-xl p-5 space-y-3">
                    <ul className="list-disc pl-5 space-y-2.5 text-slate-700 text-xs sm:text-sm">
                      {getTargetedRecommendations().map((rec, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Signature/Guidance note */}
                <div className="text-[11px] text-slate-400 text-center leading-relaxed border-t border-slate-100 pt-4 italic">
                  Note for Indian Schools: This screener corresponds to reading assessment research for young bilingual and monolingual readers. Dyslexia represents a neurological difference in word recognition and processing, and is highly responsive to explicit, structured phonics curricula and positive emotional support.
                </div>
              </div>
            </div>

            {/* PRINT-ONLY CONTAINER */}
            <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-sans z-50">
              <div className="border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-extrabold font-lexend">Scribl. Evaluation Report</h1>
                <p className="text-xs text-gray-500">Colorado Learning Disabilities Questionnaire – Reading Subscale (CLDQ-R)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-b pb-4">
                <div><strong>Student Name:</strong> {profile.name || "Student"}</div>
                <div><strong>Age:</strong> {profile.age} Yrs</div>
                <div><strong>Grade / Class:</strong> {profile.grade}</div>
                <div><strong>Date of Screening:</strong> {new Date().toLocaleDateString('en-IN')}</div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Screening Outcome</h2>
                <div className="p-3 border rounded bg-gray-50 text-sm">
                  <strong>Total CLDQ-R Score: {score} / 24 ({activeRisk?.title})</strong>
                  <p className="mt-2 text-xs leading-relaxed">{activeRisk?.text}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Response Breakdown</h2>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="py-1 px-2 border">Question</th>
                      <th className="py-1 px-2 border w-24">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREENER_QUESTIONS.map((q) => {
                      const ansVal = answers[q.id] !== undefined ? answers[q.id] : 0;
                      return (
                        <tr key={q.id} className="border-b">
                          <td className="py-1.5 px-2 border">{q.id}. {q.text}</td>
                          <td className="py-1.5 px-2 border font-mono font-bold">{ansVal} / 4</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Recommended Interventions</h2>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {getTargetedRecommendations().map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 pt-8 border-t text-center text-[10px] text-gray-400">
                This is a preliminary research-based screening questionnaire, not a medical diagnosis. Please consult a qualified educational psychologist or medical professional for full diagnosis and assistance. Created via Scribl app.
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
