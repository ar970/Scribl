import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Volume2, 
  Square, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  RefreshCw, 
  HelpCircle, 
  User, 
  GraduationCap, 
  Star, 
  VolumeX, 
  Trophy, 
  Flame, 
  Gamepad2, 
  Heart, 
  Sparkle, 
  Compass, 
  BookOpen,
  Info,
  ChevronRight,
  Printer,
  ChevronLeft,
  Clock,
  Mic,
  MicOff
} from 'lucide-react';
import { ChildProfile, ScreenerRiskLevel } from '../types';

interface ScreenerProps {
  onComplete: (score: number, riskLevel: ScreenerRiskLevel, profile: ChildProfile) => void;
  savedScore: number | null;
  savedRiskLevel: ScreenerRiskLevel | null;
  savedProfile: ChildProfile | null;
  onNavigateToReader: (initialTextPreset?: string) => void;
}

// Adjustable weights for games
const GAME_WEIGHTS = {
  letterTwins: 1.0,
  soundMatch: 1.0,
  spellSnap: 1.0,
  speedyTap: 1.0,
  pickYourPath: 1.0,
  helperStickers: 1.0
};

// Celebration compliments list
const COMPLIMENTS = [
  "You're doing awesome! ⭐",
  "Super job! 🌟",
  "Keep going! 🚀",
  "Fantastic! ✨",
  "Woohoo! 🎉",
  "Wonderful! 🎈",
  "Great clicking! 💫",
  "Amazing progress! 🌈"
];

// ----------------------------------------------------
// GAME DATA DEFINITIONS
// ----------------------------------------------------

// ----------------------------------------------------
// GAME DATA DEFINITIONS BY DIFFICULTY (Easy / Medium / Hard)
// ----------------------------------------------------

const GAME_DATA_BY_DIFFICULTY = {
  easy: {
    game1: [
      { pair: ['o', 'o'], isSame: true },
      { pair: ['b', 'd'], isSame: false },
      { pair: ['p', 'p'], isSame: true },
      { pair: ['p', 'q'], isSame: false },
      { pair: ['u', 'v'], isSame: false }
    ],
    game2: [
      {
        word: "cat",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "cat" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "cot" },
          { id: 'C', character: "Lion 🦁", speakText: "bat" }
        ],
        correctId: 'A'
      },
      {
        word: "pig",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "peg" },
          { id: 'B', character: "Teddy 🐻", speakText: "pig" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "big" }
        ],
        correctId: 'B'
      },
      {
        word: "red",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "rad" },
          { id: 'B', character: "Teddy 🐻", speakText: "rid" },
          { id: 'C', character: "Lion 🦁", speakText: "red" } // Correct
        ],
        correctId: 'C'
      },
      {
        word: "sun",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "sun" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "run" },
          { id: 'C', character: "Lion 🦁", speakText: "sin" }
        ],
        correctId: 'A'
      },
      {
        word: "dog",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "log" },
          { id: 'B', character: "Teddy 🐻", speakText: "dog" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "dig" }
        ],
        correctId: 'B'
      }
    ],
    game3: [
      {
        word: "cat",
        options: ["cat", "kat", "catt"],
        correct: "cat"
      },
      {
        word: "dog",
        options: ["dogg", "dog", "dok"],
        correct: "dog"
      },
      {
        word: "blue",
        options: ["bloo", "blu", "blue"],
        correct: "blue"
      },
      {
        word: "play",
        options: ["play", "plaie", "plai"],
        correct: "play"
      },
      {
        word: "like",
        options: ["lik", "lic", "like"],
        correct: "like"
      }
    ],
    game4: ["the", "and", "you", "say", "dog"],
    game5: [
      {
        id: 1,
        simple: "I see a fat cat. The cat sat on a mat.",
        complex: "The little cat sat quietly on the soft door mat."
      },
      {
        id: 2,
        simple: "We love to play. We have a blue ball.",
        complex: "We thoroughly enjoy tossing our big shiny blue ball."
      },
      {
        id: 3,
        simple: "The sun is hot today. Let's go swimming.",
        complex: "The blistering summer sun prompts us to dive in the cool pool."
      },
      {
        id: 4,
        simple: "I like sweet red jam. I eat it on bread.",
        complex: "Spreading delicious strawberry jam upon warm toasted bread."
      },
      {
        id: 5,
        simple: "The green frog hopped. It hopped into the pond.",
        complex: "A vibrant emerald amphibian leaped gracefully into the deep water."
      }
    ]
  },
  medium: {
    game1: [
      { pair: ['b', 'b'], isSame: true },
      { pair: ['b', 'd'], isSame: false },
      { pair: ['p', 'q'], isSame: false },
      { pair: ['m', 'm'], isSame: true },
      { pair: ['n', 'u'], isSame: false }
    ],
    game2: [
      {
        word: "tob",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "tob" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "tab" },
          { id: 'C', character: "Lion 🦁", speakText: "dob" }
        ],
        correctId: 'A'
      },
      {
        word: "fim",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "fem" },
          { id: 'B', character: "Teddy 🐻", speakText: "fim" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "feem" }
        ],
        correctId: 'B'
      },
      {
        word: "blun",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "blan" },
          { id: 'B', character: "Teddy 🐻", speakText: "clun" },
          { id: 'C', character: "Lion 🦁", speakText: "blun" } // Correct
        ],
        correctId: 'C'
      },
      {
        word: "kez",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "kez" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "koz" },
          { id: 'C', character: "Lion 🦁", speakText: "gez" }
        ],
        correctId: 'A'
      },
      {
        word: "wop",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "wap" },
          { id: 'B', character: "Teddy 🐻", speakText: "wop" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "vop" }
        ],
        correctId: 'B'
      }
    ],
    game3: [
      {
        word: "friend",
        options: ["frend", "friend", "freind"],
        correct: "friend"
      },
      {
        word: "because",
        options: ["becuase", "becoz", "because"],
        correct: "because"
      },
      {
        word: "night",
        options: ["night", "nite", "niht"],
        correct: "night"
      },
      {
        word: "school",
        options: ["shool", "school", "scool"],
        correct: "school"
      },
      {
        word: "picture",
        options: ["pikcher", "picter", "picture"],
        correct: "picture"
      }
    ],
    game4: ["cat", "house", "yellow", "happy", "garden"],
    game5: [
      {
        id: 1,
        simple: "The red fox ran fast. He jumped over a big log. He saw a small brown bird.",
        complex: "A clever reddish creature dashed swiftly across the field, gracefully leaping over a fallen timber hurdle, and spotted a tiny speckled sparrow perched high above."
      },
      {
        id: 2,
        simple: "My dog loves to play. We throw a blue ball. He catches it in his mouth.",
        complex: "My playful canine companion thoroughly enjoys retrieving our favorite azure sphere, catching it mid-air with incredible precision and enthusiasm."
      },
      {
        id: 3,
        simple: "It was a sunny day. We went to the beach. We built a big sand castle.",
        complex: "The afternoon sun shone brilliantly as our family gathered along the sandy coastline to construct an elaborate fortress complete with towering walls."
      },
      {
        id: 4,
        simple: "We love to bake cakes. We mix milk, flour, and sugar. The oven is very hot.",
        complex: "Baking delicious pastries is our favorite weekend tradition, requiring us to carefully combine fresh dairy, sifted flour, and sweet cane sugar before heating the oven."
      },
      {
        id: 5,
        simple: "The rain fell on the green grass. The sky was dark grey. We stayed inside to read.",
        complex: "Heavy precipitation cascaded steadily upon the emerald lawn beneath an overcast, charcoal sky, prompting us to remain indoors curled up with a novel."
      }
    ]
  },
  hard: {
    game1: [
      { pair: ['bld', 'dlb'], isSame: false },
      { pair: ['pqpr', 'pqpr'], isSame: true },
      { pair: ['mnnm', 'nmmn'], isSame: false },
      { pair: ['uuvu', 'uuvu'], isSame: true },
      { pair: ['ffif', 'fiff'], isSame: false }
    ],
    game2: [
      {
        word: "thrive",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "thrive" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "shrive" },
          { id: 'C', character: "Lion 🦁", speakText: "thrave" }
        ],
        correctId: 'A'
      },
      {
        word: "clung",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "klung" },
          { id: 'B', character: "Teddy 🐻", speakText: "clung" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "cling" }
        ],
        correctId: 'B'
      },
      {
        word: "frax",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "phrax" },
          { id: 'B', character: "Teddy 🐻", speakText: "frox" },
          { id: 'C', character: "Lion 🦁", speakText: "frax" } // Correct
        ],
        correctId: 'C'
      },
      {
        word: "squib",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "squib" }, // Correct
          { id: 'B', character: "Teddy 🐻", speakText: "skwib" },
          { id: 'C', character: "Lion 🦁", speakText: "squab" }
        ],
        correctId: 'A'
      },
      {
        word: "glorp",
        options: [
          { id: 'A', character: "Peacock 🦚", speakText: "glerp" },
          { id: 'B', character: "Teddy 🐻", speakText: "glorp" }, // Correct
          { id: 'C', character: "Lion 🦁", speakText: "clorp" }
        ],
        correctId: 'B'
      }
    ],
    game3: [
      {
        word: "beautiful",
        options: ["beautifull", "beautiful", "beatiful"],
        correct: "beautiful"
      },
      {
        word: "rhythm",
        options: ["rythm", "rhythum", "rhythm"],
        correct: "rhythm"
      },
      {
        word: "necessary",
        options: ["neccesary", "necessary", "necessery"],
        correct: "necessary"
      },
      {
        word: "government",
        options: ["goverment", "government", "governmnt"],
        correct: "government"
      },
      {
        word: "conscious",
        options: ["conscious", "concious", "conshus"],
        correct: "conscious"
      }
    ],
    game4: ["adventure", "dinosaur", "mysterious", "discovery", "imagination"],
    game5: [
      {
        id: 1,
        simple: "The astronomer peered through his glass. He discovered a distant galaxy. He felt amazed by the infinite cosmos.",
        complex: "Gazing intently through the high-powered telescope, the astonished astronomer detected an unexplored planetary nebula nestled amidst cosmic starlight."
      },
      {
        id: 2,
        simple: "Archaeologists dig in the sand. They find ancient golden crowns. The relics are displayed inside the local museum.",
        complex: "Meticulously excavating the dry desert terrain, dedicated researchers unearthed priceless historical artifacts representing a forgotten dynasty."
      },
      {
        id: 3,
        simple: "The mechanical robot assembled cars. It moved with precision and speed. It never got tired of doing its job.",
        complex: "Programmed with sophisticated mathematical algorithms, the automated assembly arm fabricated intricate engine parts without any human intervention."
      },
      {
        id: 4,
        simple: "Deep sea divers explore coral reefs. They swim alongside large white sharks. They capture beautiful underwater photos.",
        complex: "Equipped with specialized diving gear, marine biologists cataloged diverse aquatic species dwelling deep within the pristine sanctuary."
      },
      {
        id: 5,
        simple: "Our solar system has eight planets. They rotate around a bright star. Earth is the only planet containing life.",
        complex: "Orbiting a massive luminous sphere, several celestial bodies exhibit complex gravitational trajectories within our local interstellar neighborhood."
      }
    ]
  }
};

const getDifficultyTier = (grade: string): 'easy' | 'medium' | 'hard' => {
  if (grade === 'Grade 1' || grade === 'Grade 2') return 'easy';
  if (grade === 'Grade 3' || grade === 'Grade 4' || grade === 'Grade 5') return 'medium';
  return 'hard';
};

function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function arePhoneticallySimilar(spoken: string, target: string): boolean {
  if (!spoken) return false;
  const s = spoken.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = target.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s === t) return true;
  if (s.includes(t) || t.includes(s)) return true;
  
  // Levenshtein distance check (allow 1 or 2 typos depending on word length)
  const dist = getLevenshteinDistance(s, t);
  const maxLength = Math.max(s.length, t.length);
  
  if (maxLength <= 4 && dist <= 1) return true;
  if (maxLength > 4 && dist <= 2) return true;
  
  return false;
}

export default function Screener({ 
  onComplete, 
  savedScore, 
  savedRiskLevel, 
  savedProfile,
  onNavigateToReader 
}: ScreenerProps) {

  // Flow State: 'setup' | 'gameplay' | 'result'
  const [step, setStep] = useState<'setup' | 'gameplay' | 'result'>(
    savedScore !== null ? 'result' : 'setup'
  );

  // Profile data
  const [profile, setProfile] = useState<ChildProfile>(
    savedProfile || { name: '', age: 8, grade: 'Grade 3' }
  );

  // Gameplay active modules
  const [activeGame, setActiveGame] = useState<number>(1); // 1 through 6
  const [activeRound, setActiveRound] = useState<number>(0); // 0-based index

  // Game 1 state: list of results { correct: boolean, rxTime: number }
  const [game1Results, setGame1Results] = useState<{ correct: boolean, rxTime: number }[]>([]);
  const [g1Flashed, setG1Flashed] = useState<boolean>(true);

  // Game 2 state: list of results { correct: boolean }
  const [game2Results, setGame2Results] = useState<{ correct: boolean }[]>([]);
  const [g2SelectedOption, setG2SelectedOption] = useState<string | null>(null);

  // Game 3 state: list of results { correct: boolean }
  const [game3Results, setGame3Results] = useState<{ correct: boolean }[]>([]);

  // Game 4 state: list of elapsed times (ms) per word
  const [game4Results, setGame4Results] = useState<number[]>([]);

  // Game 4 Pronunciation detailed speech results
  const [game4Pronunciations, setGame4Pronunciations] = useState<{
    word: string;
    spokenText: string;
    correct: boolean;
    audioUrl: string | null;
  }[]>([]);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState<string>("");
  const [g4HasRecorded, setG4HasRecorded] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Game 5 state: list of difficulty chosen ('simple' | 'complex')
  const [game5Results, setGame5Results] = useState<('simple' | 'complex')[]>([]);

  // Game 6 state: 'helper' | 'own'
  const [game6Result, setGame6Result] = useState<'helper' | 'own' | null>(null);

  // Timing markers for reaction time measurements
  const roundStartTimeRef = useRef<number>(Date.now());
  const g1FlashTimerRef = useRef<any>(null);

  const triggerG1Flash = () => {
    setG1Flashed(true);
    if (g1FlashTimerRef.current) {
      clearTimeout(g1FlashTimerRef.current);
    }
    g1FlashTimerRef.current = setTimeout(() => {
      setG1Flashed(false);
    }, 2000);
  };

  // Celebration state
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [currentCompliment, setCurrentCompliment] = useState<string>("");

  // Answer states for showing correctness and preventing multiple clicks
  const [g1Answered, setG1Answered] = useState<boolean>(false);
  const [g1Selected, setG1Selected] = useState<boolean | null>(null);
  const [g2Answered, setG2Answered] = useState<boolean>(false);
  const [g3Answered, setG3Answered] = useState<boolean>(false);
  const [g3Selected, setG3Selected] = useState<string | null>(null);
  const [celebrationCorrect, setCelebrationCorrect] = useState<boolean>(true);

  // Score & evaluation variables
  const [finalScore, setFinalScore] = useState<number>(savedScore || 0);
  const [finalRisk, setFinalRisk] = useState<ScreenerRiskLevel>(savedRiskLevel || 'low');

  // Configurable Speedy Tap reading speed benchmark (default 2.5 seconds per word)
  const [speedBenchmark, setSpeedBenchmark] = useState<number>(2.5);

  // Dynamic rounds based on selected grade difficulty
  const [g1Rounds, setG1Rounds] = useState<any[]>(GAME_DATA_BY_DIFFICULTY.medium.game1);
  const [g2Rounds, setG2Rounds] = useState<any[]>(GAME_DATA_BY_DIFFICULTY.medium.game2);
  const [g3Rounds, setG3Rounds] = useState<any[]>(GAME_DATA_BY_DIFFICULTY.medium.game3);
  const [g4Words, setG4Words] = useState<string[]>(GAME_DATA_BY_DIFFICULTY.medium.game4);
  const [g5Rounds, setG5Rounds] = useState<any[]>(GAME_DATA_BY_DIFFICULTY.medium.game5);

  // Timer State (40 seconds per round) and Relaxed Mode
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [relaxedMode, setRelaxedMode] = useState<boolean>(false);

  // Automatically update active game data states if savedProfile exists
  useEffect(() => {
    if (savedProfile) {
      const diff = getDifficultyTier(savedProfile.grade);
      const data = GAME_DATA_BY_DIFFICULTY[diff];
      setG1Rounds(data.game1);
      setG2Rounds(data.game2);
      setG3Rounds(data.game3);
      setG4Words(data.game4);
      setG5Rounds(data.game5);
      if (diff === 'easy') {
        setSpeedBenchmark(4.0);
      } else if (diff === 'medium') {
        setSpeedBenchmark(2.5);
      } else {
        setSpeedBenchmark(1.2);
      }
    }
  }, [savedProfile]);

  // Reset timer on active round/game change
  useEffect(() => {
    if (step === 'gameplay') {
      const initialTime = activeGame === 1 ? 60 : 40;
      setTimeLeft(initialTime);
    }
  }, [step, activeGame, activeRound]);

  const handleRoundTimeout = () => {
    // If we've already answered, do nothing
    if (activeGame === 1 && g1Answered) return;
    if (activeGame === 2 && g2Answered) return;
    if (activeGame === 3 && g3Answered) return;

    if (activeGame === 1) {
      setG1Answered(true);
      setG1Selected(null);
      
      const rxTime = 60;
      const newResults = [...game1Results, { correct: false, rxTime }];
      setGame1Results(newResults);

      setTimeout(() => {
        triggerCelebration(false, () => {
          setG1Answered(false);
          setG1Selected(null);
          if (activeRound < g1Rounds.length - 1) {
            setActiveRound(prev => prev + 1);
          } else {
            setActiveGame(2);
            setActiveRound(0);
          }
        });
      }, 500);
    } else if (activeGame === 2) {
      setG2Answered(true);

      const newResults = [...game2Results, { correct: false }];
      setGame2Results(newResults);

      setTimeout(() => {
        triggerCelebration(false, () => {
          setG2Answered(false);
          setG2SelectedOption(null);
          if (activeRound < g2Rounds.length - 1) {
            setActiveRound(prev => prev + 1);
          } else {
            setActiveGame(3);
            setActiveRound(0);
            setTimeout(() => {
              if (g3Rounds && g3Rounds[0]) {
                speakTargetWord("Spell " + g3Rounds[0].word, 0.75);
              }
            }, 400);
          }
        });
      }, 500);
    } else if (activeGame === 3) {
      setG3Answered(true);
      setG3Selected(null);

      const newResults = [...game3Results, { correct: false }];
      setGame3Results(newResults);

      setTimeout(() => {
        triggerCelebration(false, () => {
          setG3Answered(false);
          setG3Selected(null);
          if (activeRound < g3Rounds.length - 1) {
            const nextRound = activeRound + 1;
            setActiveRound(nextRound);
            setTimeout(() => {
              if (g3Rounds && g3Rounds[nextRound]) {
                speakTargetWord("Spell " + g3Rounds[nextRound].word, 0.75);
              }
            }, 400);
          } else {
            setActiveGame(4);
            setActiveRound(0);
          }
        });
      }, 500);
    } else if (activeGame === 4) {
      const elapsedMs = 40000;
      const newResults = [...game4Results, elapsedMs];
      setGame4Results(newResults);

      triggerCelebration(false, () => {
        if (activeRound < g4Words.length - 1) {
          setActiveRound(prev => prev + 1);
        } else {
          setActiveGame(5);
          setActiveRound(0);
        }
      });
    } else if (activeGame === 5) {
      const newResults = [...game5Results, 'simple'];
      setGame5Results(newResults);

      triggerCelebration(false, () => {
        if (activeRound < g5Rounds.length - 1) {
          setActiveRound(prev => prev + 1);
        } else {
          setActiveGame(6);
          setActiveRound(0);
        }
      });
    }
  };

  // Countdown timer interval
  useEffect(() => {
    if (step !== 'gameplay') return;
    if (relaxedMode) return; // Completely freeze the timer if relaxedMode is active!

    // Do not tick down if we are currently showing celebration, or if answer has been submitted/recorded
    const isAnswered = 
      (activeGame === 1 && g1Answered) ||
      (activeGame === 2 && g2Answered) ||
      (activeGame === 3 && g3Answered);

    if (isAnswered) return;

    // Timer is only active for Game 1, 2, 3, 4, 5
    if (activeGame > 5) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, activeGame, activeRound, g1Answered, g2Answered, g3Answered, g1Rounds, g2Rounds, g3Rounds, g4Words, g5Rounds, relaxedMode]);

  // TTS helper
  const speakTargetWord = (word: string, rate = 0.85) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = rate;
      utterance.pitch = 1.15; // friendly childish pitch
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-') || v.lang.startsWith('en_'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keep track of voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Game 4 pronunciation mic functionality
  const startRecording = async () => {
    setAudioUrl(null);
    setSpokenText("");
    setG4HasRecorded(false);
    audioChunksRef.current = [];

    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        
        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setSpokenText(currentTranscript.trim());
          }
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (e) {
        console.warn("Could not start speech recognition:", e);
      }
    }

    // Setup standard MediaRecorder for audio playback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Find supported mime type to maximize compatibility (Safari, Chrome, Firefox, iOS)
        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
          }
        }

        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const typeToUse = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: typeToUse });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setG4HasRecorded(true);

          // Stop all audio tracks to release the microphone!
          stream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (e) {
              console.warn("Error stopping audio track:", e);
            }
          });
        };

        mediaRecorder.start(200); // chunk every 200ms to avoid audio losses
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to access microphone:", err);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    } else {
      setG4HasRecorded(true);
    }

    // Stop SpeechRecognition (ensure we let it capture the last word first)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("SpeechRecognition stop error:", e);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error("Playback failed:", err));
    }
  };

  // Flash timer for Game 1 (2 seconds)
  useEffect(() => {
    if (step === 'gameplay' && activeGame === 1) {
      triggerG1Flash();
      roundStartTimeRef.current = Date.now();
      return () => {
        if (g1FlashTimerRef.current) {
          clearTimeout(g1FlashTimerRef.current);
        }
      };
    }
  }, [step, activeGame, activeRound]);

  // Record round start time for other games (automatic speech removed to prevent timing / state update conflicts)
  useEffect(() => {
    if (step === 'gameplay') {
      roundStartTimeRef.current = Date.now();
    }
  }, [step, activeGame, activeRound]);

  // Trigger celebratory confetti animation only after finishing all games
  useEffect(() => {
    if (step === 'result') {
      // First general center-burst of confetti
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#10b981', '#6366f1', '#f59e0b', '#ec4899']
      });

      // Side bursts for extra delight!
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#2dd4bf', '#10b981', '#6366f1', '#f59e0b', '#ec4899']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#2dd4bf', '#10b981', '#6366f1', '#f59e0b', '#ec4899']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      // Delay side bursts slightly so center-burst resolves beautifully
      setTimeout(() => {
        requestAnimationFrame(frame);
      }, 350);
    }
  }, [step]);

  const triggerCelebration = (isCorrect: boolean, callback: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Set celebration correct to true so it always displays the cheerful style!
    setCelebrationCorrect(true);
    // Select any cheerful compliment from the list randomly
    const compliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    setCurrentCompliment(compliment);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      callback();
    }, 1500);
  };

  // ----------------------------------------------------
  // ACTION HANDLERS FOR EACH GAME
  // ----------------------------------------------------

  // Game 1 Choice Handler
  const handleGame1Choice = (chosenSame: boolean) => {
    if (g1Answered) return;
    setG1Answered(true);
    setG1Selected(chosenSame);

    const currentPair = g1Rounds[activeRound];
    const isCorrect = chosenSame === currentPair.isSame;
    const rxTime = (Date.now() - roundStartTimeRef.current) / 1000;

    const newResults = [...game1Results, { correct: isCorrect, rxTime }];
    setGame1Results(newResults);

    setTimeout(() => {
      triggerCelebration(isCorrect, () => {
        setG1Answered(false);
        setG1Selected(null);
        if (activeRound < g1Rounds.length - 1) {
          setActiveRound(prev => prev + 1);
        } else {
          // Go to Game 2
          setActiveGame(2);
          setActiveRound(0);
        }
      });
    }, 800);
  };

  // Game 2 Choice Handler
  const handleGame2Choice = (optionId: string) => {
    if (g2Answered) return;
    setG2Answered(true);

    const currentRound = g2Rounds[activeRound];
    const isCorrect = optionId === currentRound.correctId;

    const newResults = [...game2Results, { correct: isCorrect }];
    setGame2Results(newResults);

    setTimeout(() => {
      triggerCelebration(isCorrect, () => {
        setG2Answered(false);
        setG2SelectedOption(null);
        if (activeRound < g2Rounds.length - 1) {
          setActiveRound(prev => prev + 1);
        } else {
          // Go to Game 3
          setActiveGame(3);
          setActiveRound(0);
          // Speak the first word of Game 3 after a small delay so they see the screen transition!
          setTimeout(() => {
            speakTargetWord("Spell " + g3Rounds[0].word, 0.75);
          }, 400);
        }
      });
    }, 1000);
  };

  // Game 3 Choice Handler
  const handleGame3Choice = (selectedSpelling: string) => {
    if (g3Answered) return;
    setG3Answered(true);
    setG3Selected(selectedSpelling);

    const currentRound = g3Rounds[activeRound];
    const isCorrect = selectedSpelling === currentRound.correct;

    const newResults = [...game3Results, { correct: isCorrect }];
    setGame3Results(newResults);

    setTimeout(() => {
      triggerCelebration(isCorrect, () => {
        setG3Answered(false);
        setG3Selected(null);
        if (activeRound < g3Rounds.length - 1) {
          const nextRound = activeRound + 1;
          setActiveRound(nextRound);
          // Speak the next word!
          setTimeout(() => {
            speakTargetWord("Spell " + g3Rounds[nextRound].word, 0.75);
          }, 400);
        } else {
          // Go to Game 4
          setActiveGame(4);
          setActiveRound(0);
        }
      });
    }, 800);
  };

  // Game 4 Choice Handler (Speedy Tap + Speech Pronunciation Recorder)
  const handleGame4Tap = (overrideSpokenText?: string) => {
    const elapsedMs = Date.now() - roundStartTimeRef.current;
    const newResults = [...game4Results, elapsedMs];
    setGame4Results(newResults);
 
    // Evaluate correct/incorrect based on speech recognition
    const targetWord = g4Words[activeRound];
    const actualSpoken = overrideSpokenText !== undefined ? overrideSpokenText : spokenText;
    
    const isSkipped = actualSpoken === "(Skipped)";
    const isCorrect = !isSkipped && arePhoneticallySimilar(actualSpoken, targetWord);
 
    const newPronunciations = [
      ...game4Pronunciations,
      {
        word: targetWord,
        spokenText: actualSpoken || "(No voice detected)",
        correct: isCorrect,
        audioUrl: audioUrl
      }
    ];
    setGame4Pronunciations(newPronunciations);
 
    // Reset current round microphone states
    setAudioUrl(null);
    setSpokenText("");
    setG4HasRecorded(false);
 
    triggerCelebration(true, () => {
      if (activeRound < g4Words.length - 1) {
        setActiveRound(prev => prev + 1);
      } else {
        // Go to Game 5
        setActiveGame(5);
        setActiveRound(0);
      }
    });
  };

  // Game 5 Choice Handler (Pick Your Path)
  const handleGame5Choice = (chosenTier: 'simple' | 'complex') => {
    const newResults = [...game5Results, chosenTier];
    setGame5Results(newResults);

    triggerCelebration(true, () => {
      if (activeRound < g5Rounds.length - 1) {
        setActiveRound(prev => prev + 1);
      } else {
        // Go to Game 6
        setActiveGame(6);
        setActiveRound(0);
      }
    });
  };

  // Game 6 Choice Handler (Helper Stickers)
  const handleGame6Choice = (choice: 'helper' | 'own') => {
    setGame6Result(choice);

    triggerCelebration(true, () => {
      calculateFinalResults(choice);
    });
  };

  // ----------------------------------------------------
  // SCORING AND COMPUTATIONS
  // ----------------------------------------------------
  const calculateFinalResults = (g6Value: 'helper' | 'own') => {
    // 1. Game 1 Performance: Accuracy ratio
    const g1Correct = game1Results.filter(r => r.correct).length;
    const g1Score = (g1Correct / g1Rounds.length) * 100;

    // 2. Game 2 Performance: Accuracy ratio
    const g2Correct = game2Results.filter(r => r.correct).length;
    const g2Score = (g2Correct / g2Rounds.length) * 100;

    // 3. Game 3 Performance: Accuracy ratio
    const g3Correct = game3Results.filter(r => r.correct).length;
    const g3Score = (g3Correct / g3Rounds.length) * 100;

    // 4. Game 4 Performance: speed check relative to benchmark
    // If average word reading time is under benchmark, full performance, else proportional
    const avgSpeedSeconds = game4Results.reduce((a, b) => a + b, 0) / game4Results.length / 1000;
    // Cap reading performance score: if avg <= benchmark -> 100%, if avg >= 5s -> 20%, linear interpolation between
    let g4Score = 100;
    if (avgSpeedSeconds > speedBenchmark) {
      const excess = avgSpeedSeconds - speedBenchmark;
      g4Score = Math.max(20, 100 - (excess / 3.0) * 80);
    }

    // 5. Game 5 Performance: Preference tier
    // Count how many complex paths picked. Max complex picks = 100%, 0 = 40%
    const complexCount = game5Results.filter(path => path === 'complex').length;
    const g5Score = 40 + (complexCount / g5Rounds.length) * 60;

    // 6. Game 6 Performance: Stickers choice
    const g6Score = g6Value === 'own' ? 100 : 50;

    // Calculate weighted average performance
    const weightedSum = 
      (g1Score * GAME_WEIGHTS.letterTwins) +
      (g2Score * GAME_WEIGHTS.soundMatch) +
      (g3Score * GAME_WEIGHTS.spellSnap) +
      (g4Score * GAME_WEIGHTS.speedyTap) +
      (g5Score * GAME_WEIGHTS.pickYourPath) +
      (g6Score * GAME_WEIGHTS.helperStickers);

    const weightsTotal = Object.values(GAME_WEIGHTS).reduce((a, b) => a + b, 0);
    const overallPerformance = weightedSum / weightsTotal;

    // Convert performance score (0-100) to risk score: 100 means high risk, 0 means low risk
    // This maintains alignment with the parent app where high score indicates high risk
    const computedRiskScore = Math.round(100 - overallPerformance);

    // Risk Buckets
    let riskLvl: ScreenerRiskLevel = 'low';
    if (computedRiskScore > 60) {
      riskLvl = 'high';
    } else if (computedRiskScore > 25) {
      riskLvl = 'mid';
    }

    setFinalScore(computedRiskScore);
    setFinalRisk(riskLvl);
    setStep('result');

    // Notify parent
    onComplete(computedRiskScore, riskLvl, profile);
  };

  const handleStartGames = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) return;
    
    // Configure grade-based dynamic difficulty rounds and benchmarks
    const diff = getDifficultyTier(profile.grade);
    const data = GAME_DATA_BY_DIFFICULTY[diff];
    setG1Rounds(data.game1);
    setG2Rounds(data.game2);
    setG3Rounds(data.game3);
    setG4Words(data.game4);
    setG5Rounds(data.game5);
    
    if (diff === 'easy') {
      setSpeedBenchmark(4.0);
    } else if (diff === 'medium') {
      setSpeedBenchmark(2.5);
    } else {
      setSpeedBenchmark(1.2);
    }

    // Reset game states
    setGame1Results([]);
    setGame2Results([]);
    setGame3Results([]);
    setGame4Results([]);
    setGame5Results([]);
    setGame6Result(null);
    setActiveGame(1);
    setActiveRound(0);
    setStep('gameplay');
  };

  const handleRestart = () => {
    setStep('setup');
  };

  // Compute game-specific performance scores for results feedback
  const getIndividualScores = () => {
    const g1Correct = game1Results.filter(r => r.correct).length;
    const g1Score = Math.round((g1Correct / (g1Rounds.length || 1)) * 100);

    const g2Correct = game2Results.filter(r => r.correct).length;
    const g2Score = Math.round((g2Correct / (g2Rounds.length || 1)) * 100);

    const g3Correct = game3Results.filter(r => r.correct).length;
    const g3Score = Math.round((g3Correct / (g3Rounds.length || 1)) * 100);

    const avgSpeedSeconds = game4Results.length > 0
      ? (game4Results.reduce((a, b) => a + b, 0) / game4Results.length / 1000)
      : 0;

    const complexCount = game5Results.filter(path => path === 'complex').length;

    return {
      letterTwins: g1Score,
      soundMatch: g2Score,
      spellSnap: g3Score,
      speedyTapSeconds: avgSpeedSeconds,
      pickYourPathComplex: complexCount,
      helperChoice: game6Result
    };
  };

  const scoresInfo = getIndividualScores();

  // Bullet generation based on low performance criteria
  const getPersonalizedBullets = () => {
    const bullets: string[] = [];

    // Let's check which specific categories might need reading accommodation support
    if (scoresInfo.letterTwins < 75) {
      bullets.push("Confusing similar letter shapes (like b/d and p/q in Letter Twins) is a very natural learning stage. Our reader tool lets you double letter-spacing to make individual shape boundaries highly distinct!");
    }
    if (scoresInfo.soundMatch < 75) {
      bullets.push("Connecting new phonics groups (sound matching) took some extra concentration today. The reader tool's automatic Syllable Highlighter can split long words into small, cozy sound blocks to build blending confidence.");
    }
    if (scoresInfo.spellSnap < 75) {
      bullets.push("Orthographical spelling choices (like Spell Snap) felt a little tricky. Reading using our high-contrast Lexend font helps train reading eyes to remember letter sequences cleanly without visual stress.");
    }
    if (scoresInfo.speedyTapSeconds > speedBenchmark) {
      bullets.push(`Reading speed averaged ${scoresInfo.speedyTapSeconds.toFixed(1)} seconds per word, which is a bit slow. Activating the reader's sliding Focus Ruler keeps eyes on line and increases reading pace naturally!`);
    }
    if (scoresInfo.pickYourPathComplex < 2) {
      bullets.push("A preference for simpler passages indicates that dense school paragraphs can quickly feel tiring. You can paste any textbook page into the custom reader tab to read with gentle, spaced custom lines.");
    }
    if (scoresInfo.helperChoice === 'helper') {
      bullets.push("Reading with a helper is sweet, but reading on your own is wonderful too! Our reader tool has a Play Aloud button with adjustable phonics speed so your child can practice reading independently.");
    }

    // Default encouraging bullet if everything went super well
    if (bullets.length === 0) {
      bullets.push("Excellent letter-shape tracking and phonic blending! Keep exploring stories with our reader tool to maintain your wonderful momentum.");
      bullets.push("The custom focus tools (ruler, spacing controls, and soft pastel mint/cream backgrounds) can help keep reading sessions fun and free of tired eyes.");
    }

    return bullets;
  };

  // Risk Color Scheme Map
  const getRiskUI = (level: ScreenerRiskLevel) => {
    switch (level) {
      case 'low':
        return {
          title: "Bright & Confident Explorer 🌟",
          subtitle: "Minimal reading support indicators",
          cardBg: "bg-teal-50/60 border-teal-200 text-teal-950",
          progressColor: "bg-teal-600",
          textColor: "text-teal-900"
        };
      case 'mid':
        return {
          title: "Steady Growing Reader 🌱",
          subtitle: "Moderate reading support indicators recommended",
          cardBg: "bg-amber-50/60 border-amber-200 text-amber-950",
          progressColor: "bg-amber-600",
          textColor: "text-amber-900"
        };
      case 'high':
        return {
          title: "Scribl Brave Explorer 🚀",
          subtitle: "Specialized focus support and reading tools recommended",
          cardBg: "bg-indigo-50/60 border-indigo-200 text-indigo-950",
          progressColor: "bg-indigo-600",
          textColor: "text-indigo-900"
        };
    }
  };

  const riskUI = getRiskUI(finalRisk);

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="print:hidden mb-8 text-center sm:text-left border-b border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-lexend flex items-center justify-center sm:justify-start gap-2 select-none">
              Scribl<span className="text-teal-500 text-5xl font-sans leading-none">.</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-teal-500 text-white rounded-full text-[11px] font-bold shadow-xs ml-2">
                <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
                Playful Reader Space
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Encouraging reading feedback & visual support matching for Indian school classrooms
            </p>
          </div>
          {step === 'result' && (
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 bg-white rounded-xl text-xs font-bold transition cursor-pointer self-center sm:self-auto shadow-xs select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Play Games Again 🎮
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: PLAYFUL INTRO CARD & PROFILE SETTING */}
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left intro visual column */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-full text-xs font-bold">
                <Sparkle className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                Reading Game Hub
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none font-lexend">
                Enriching Every Child to Learn and Grow! 🌟
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-lexend">
                Welcome to Scribl games! We've designed 6 interactive micro-challenges to explore letter shapes, sounds, and word speeds in a highly friendly workspace. No scary timers, no grading stress—just pure game joy!
              </p>

              {/* Graphic container with cozy classroom theme */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-orange-400 via-amber-400 to-teal-400 rounded-3xl blur-md opacity-25" />
                <div className="relative bg-white p-2.5 rounded-2xl border border-slate-100 shadow-lg overflow-hidden transform hover:scale-[1.01] transition duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&h=700&q=80"
                    alt="Happy child enjoying playing games and reading books in a supportive atmosphere"
                    className="w-full h-auto object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating bubble explaining the stress-free environment */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-slate-100/80 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center text-sm font-black animate-bounce">
                        👑
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800 block text-xs font-lexend">100% Encouraging Workspace</span>
                        <span className="text-slate-500 text-[10px] leading-relaxed block">
                          Your child will always play with starry sparkles, gentle guides, and friendly animal characters.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Setup Form Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" /> Reader Registration
                </div>
                <h2 className="text-2xl font-bold text-slate-800 font-lexend">
                  Enter Your Player Details
                </h2>
                <p className="text-slate-500 text-xs font-lexend">
                  Before we jump into the games, tell us a bit about yourself so we can configure your personalized game board!
                </p>
              </div>

              <form onSubmit={handleStartGames} className="space-y-4 border-t border-slate-50 pt-5">
                <div className="space-y-4">
                  {/* Name input */}
                  <div>
                    <label htmlFor="student-name" className="block text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide font-lexend">
                      Your First Name / Nickname 🐯
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      placeholder="e.g., Aarav"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 hover:bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-lexend font-bold"
                      required
                    />
                  </div>

                  {/* Age & Class Grade selects */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="student-age" className="block text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide font-lexend">
                        Age 🎂
                      </label>
                      <input
                        id="student-age"
                        type="number"
                        min="5"
                        max="16"
                        value={profile.age}
                        onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 8 }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-lexend font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="student-grade" className="block text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide font-lexend">
                        Class / Grade 🎒
                      </label>
                      <select
                        id="student-grade"
                        value={profile.grade}
                        onChange={(e) => setProfile(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer font-lexend font-bold text-slate-700"
                      >
                        <option value="Grade 1">Grade 1 (Class 1)</option>
                        <option value="Grade 2">Grade 2 (Class 2)</option>
                        <option value="Grade 3">Grade 3 (Class 3)</option>
                        <option value="Grade 4">Grade 4 (Class 4)</option>
                        <option value="Grade 5">Grade 5 (Class 5)</option>
                        <option value="Grade 6">Grade 6 (Class 6)</option>
                        <option value="Grade 7">Grade 7 (Class 7)</option>
                        <option value="Grade 8">Grade 8 (Class 8)</option>
                        <option value="Grade 9+">Grade 9+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    id="start-screening-btn"
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl transition shadow-sm hover:shadow-md cursor-pointer text-sm tracking-wide font-lexend select-none"
                  >
                    <span>Start Games Now! 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Informative footer card without clinical jargon */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-lexend">
                  Scribl uses a cognitive multisensory framework to screen for letter spacing needs, sound processing (phonics), and comfortable visual reading speeds, automatically suggestions the best configurations.
                </p>
              </div>
            </div>

            {/* Revenue Model Section - Smoothly Attached */}
            <div className="lg:col-span-12 mt-10 pt-10 border-t border-slate-100/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-lexend">
                    Revenue Model
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-lexend font-medium">
                    Scribl's sustainable plan built to support schools and families across India.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[11px] font-black self-start sm:self-auto uppercase tracking-wider">
                  ✨ Simple Pricing
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Freemium Card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 border-l-4 border-l-teal-500 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-slate-800 font-lexend">
                        Freemium
                      </h4>
                      <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md uppercase">
                        Free Snapshot
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-lexend font-medium">
                      Free diagnostic snapshot — shareable, designed to spread through parent communities
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-lexend font-bold">
                    <span>Diagnostic Test + Results</span>
                    <span className="text-teal-600">Included 🎒</span>
                  </div>
                </div>

                {/* Paid Card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 border-l-4 border-l-emerald-500 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-slate-800 font-lexend">
                        Paid
                      </h4>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">
                        Subscription
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-lexend font-medium">
                      ₹299–499/month subscription
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-lexend font-bold">
                    <span>Full Classroom Support & Personalized Settings</span>
                    <span className="text-emerald-600">Access Tools 🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: REUSABLE mini-GAME ACTIVE PLAYGROUND */}
        {step === 'gameplay' && (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* GLOBAL GAMES TIMELINE SUMMARY */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold text-slate-500 font-lexend">
                <span className="flex items-center gap-2 text-teal-800">
                  <span className="text-base">🎮</span>
                  Player: <span className="text-teal-600">{profile.name}</span>
                </span>
                
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[11px]">
                  Game {activeGame} of 6
                </span>
              </div>

              {/* Global 6-game step nodes progress */}
              <div className="flex items-center gap-1.5 w-full">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  let barState = "bg-slate-100 border-slate-200";
                  if (num < activeGame) {
                    barState = "bg-teal-500";
                  } else if (num === activeGame) {
                    barState = "bg-amber-500 animate-pulse";
                  }
                  return (
                    <div 
                      key={num} 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${barState}`}
                      title={`Game ${num}`}
                    />
                  );
                })}
              </div>

              {/* Visual Countdown Timer Pill */}
              {activeGame <= 5 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-3 mt-1 text-xs font-lexend select-none gap-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                      <span>Timer Status:</span>
                      {relaxedMode ? (
                        <span className="text-indigo-600 font-extrabold flex items-center gap-1 animate-pulse">
                          <span>🐢 Relaxed Mode Active!</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard ({activeGame === 1 ? '60s' : '40s'})</span>
                      )}
                    </div>

                    {/* Relaxed Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setRelaxedMode(!relaxedMode)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center gap-1 cursor-pointer select-none border ${
                        relaxedMode 
                          ? "bg-indigo-100 border-indigo-200 text-indigo-950 shadow-inner" 
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>🐢 No Timer</span>
                      <div className={`w-6 h-3 rounded-full relative transition ${relaxedMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all duration-300 ${relaxedMode ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </button>
                  </div>

                  {!relaxedMode && (
                    <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                      {/* Progress countdown line */}
                      <div className="w-24 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-rose-500 animate-pulse' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-teal-500'}`} 
                          style={{ width: `${(timeLeft / (activeGame === 1 ? 60 : 40)) * 100}%` }}
                        />
                      </div>
                      <span className={`font-black min-w-[24px] text-right tracking-wide ${timeLeft <= 10 ? 'text-rose-600 font-extrabold text-sm animate-bounce' : 'text-slate-700'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CELEBRATION ROUND INTERCEPTOR */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/20 backdrop-blur-xs p-4"
                >
                  <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-teal-400 space-y-4 animate-bounce">
                    <div className="text-6xl animate-pulse">🎉</div>
                    <h3 className="text-2xl font-black text-teal-950 font-lexend">
                      {currentCompliment}
                    </h3>
                    <div className="flex justify-center gap-1">
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                      <Star className="w-8 h-8 text-amber-500 fill-amber-500 -translate-y-1" />
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-teal-700 text-xs font-bold uppercase tracking-wider font-lexend">
                      Progress Saved! Keep going! 🚀
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ====================================================
                GAME MODULES
               ==================================================== */}

            {/* GAME 1: LETTER TWINS 👯 */}
            {activeGame === 1 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>👯 Game 1: Letter Twins</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Look closely! A pair of letters will flash for 2 seconds. Tell us if they are the exact same twins or if they are different!
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[11px] font-bold">
                    Round {activeRound + 1} of {g1Rounds.length}
                  </div>
                </div>

                {/* Stimulus display box */}
                <div className="h-44 bg-gradient-to-br from-amber-50/50 to-orange-50/20 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                  {g1Flashed ? (
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex gap-12 text-slate-800 font-extrabold select-none tracking-widest text-[90px] sm:text-[100px] leading-none"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      <span>{g1Rounds[activeRound].pair[0]}</span>
                      <span>{g1Rounds[activeRound].pair[1]}</span>
                    </motion.div>
                  ) : (
                    <div className="text-center space-y-2.5">
                      <span className="text-5xl text-slate-300 block">❓ ❓</span>
                      {!g1Answered && (
                        <button
                          type="button"
                          onClick={triggerG1Flash}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg transition cursor-pointer select-none inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>👁️ Show Twins Again</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Shading countdown timer bar */}
                  {g1Flashed && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 2.0, ease: 'linear' }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Choice buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="g1-btn-same"
                    onClick={() => handleGame1Choice(true)}
                    disabled={g1Answered}
                    className={`py-4 border-2 rounded-2xl font-black text-sm transition select-none flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-xs ${
                      g1Answered
                        ? g1Selected === true
                          ? "bg-indigo-600 border-indigo-700 text-white cursor-not-allowed"
                          : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-teal-50 hover:bg-teal-100/70 text-teal-900 border-2 border-teal-200/80 cursor-pointer"
                    }`}
                  >
                    <span className="text-xl">👯</span>
                    <span>Same twins!</span>
                  </button>

                  <button
                    id="g1-btn-different"
                    onClick={() => handleGame1Choice(false)}
                    disabled={g1Answered}
                    className={`py-4 border-2 rounded-2xl font-black text-sm transition select-none flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-xs ${
                      g1Answered
                        ? g1Selected === false
                          ? "bg-indigo-600 border-indigo-700 text-white cursor-not-allowed"
                          : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-rose-50 hover:bg-rose-100/70 text-rose-950 border-2 border-rose-200/80 cursor-pointer"
                    }`}
                  >
                    <span className="text-xl">🙅</span>
                    <span>Different!</span>
                  </button>
                </div>
              </div>
            )}

            {/* GAME 2: SOUND MATCH 🔊 */}
            {activeGame === 2 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>🔊 Game 2: Sound Match</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Here's a made-up word. Tap the cute speaker animals to listen to their sounds, and pick the one that says the word correctly!
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[11px] font-bold">
                    Round {activeRound + 1} of {g2Rounds.length}
                  </div>
                </div>

                {/* Made up Word display */}
                <div className="py-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Made-up Word:</span>
                  <span className="text-5xl font-black text-indigo-950 select-none tracking-wide" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {g2Rounds[activeRound].word}
                  </span>
                </div>

                {/* Speaker selection lists */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {g2Rounds[activeRound].options.map((opt) => {
                    const isSelected = g2SelectedOption === opt.id;

                    let optionStyle = "bg-white border-slate-200 hover:border-slate-300";
                    if (g2Answered) {
                      if (isSelected) {
                        optionStyle = "bg-indigo-50 border-indigo-400 shadow-xs ring-2 ring-indigo-400/20 text-indigo-950";
                      } else {
                        optionStyle = "bg-slate-50/50 border-slate-100 text-slate-300 opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-amber-50/60 border-amber-500 shadow-sm ring-2 ring-amber-400/20";
                    }

                    return (
                      <div 
                        key={opt.id}
                        className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-between text-center space-y-3 transition-all ${optionStyle}`}
                      >
                        <span className={`text-xs font-black block ${g2Answered && !isSelected ? 'text-slate-400' : 'text-slate-600'}`}>{opt.character}</span>
                        
                        {/* Play individual audio button */}
                        <button
                          type="button"
                          disabled={g2Answered}
                          onClick={() => speakTargetWord(opt.speakText, 0.75)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer shadow-xs select-none ${
                            g2Answered ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-teal-50 hover:bg-teal-100 text-teal-600'
                          }`}
                          title="Click to hear speech"
                        >
                          <Volume2 className="w-5 h-5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                        </button>

                        <button
                          type="button"
                          disabled={g2Answered}
                          onClick={() => setG2SelectedOption(opt.id)}
                          className={`w-full py-2 rounded-xl text-xs font-black transition cursor-pointer select-none ${
                            g2Answered
                              ? isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-400'
                              : isSelected 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {g2Answered
                            ? isSelected
                              ? "Locked in! 🔒"
                              : "Locked"
                            : isSelected ? "Selected! 🎯" : "Select this 🌟"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    id="g2-submit-btn"
                    onClick={() => g2SelectedOption && handleGame2Choice(g2SelectedOption)}
                    disabled={!g2SelectedOption || g2Answered}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition select-none flex items-center justify-center gap-1.5 ${
                      g2SelectedOption && !g2Answered
                        ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm hover:shadow-md' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Lock in my choice! 🔒</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* GAME 3: SPELL SNAP 🧩 */}
            {activeGame === 3 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>🧩 Game 3: Spell Snap</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Listen to the word spoken aloud, then tap the card that shows the correct spelling spelling!
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[11px] font-bold">
                    Round {activeRound + 1} of {g3Rounds.length}
                  </div>
                </div>

                {/* Audio speaker trigger */}
                <div className="p-5 bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100/60 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-extrabold text-teal-950 uppercase tracking-wide">Click to hear the spelling word again:</p>
                  <button
                    id="g3-replay-sound-btn"
                    type="button"
                    disabled={g3Answered}
                    onClick={() => speakTargetWord("Spell " + g3Rounds[activeRound].word, 0.75)}
                    className="mx-auto inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs select-none"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Hear Spelling Word 📣</span>
                  </button>
                </div>

                {/* Choice buttons list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {g3Rounds[activeRound].options.map((option, idx) => {
                    const isSelected = g3Selected === option;
                    
                    let btnStyle = "bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/10 text-slate-800 cursor-pointer";
                    if (g3Answered) {
                      if (isSelected) {
                        btnStyle = "bg-indigo-600 border-indigo-700 text-white cursor-not-allowed animate-pulse";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        id={`g3-opt-${idx}`}
                        key={option}
                        onClick={() => handleGame3Choice(option)}
                        disabled={g3Answered}
                        className={`p-5 border-2 font-black text-lg rounded-2xl transition select-none text-center shadow-xs ${btnStyle}`}
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GAME 4: SPEEDY TAP ⚡ */}
            {activeGame === 4 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>⚡ Game 4: Pronunciation Play</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Tap the microphone, say the word clearly, and play it back to hear your lovely pronunciation!
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[11px] font-bold">
                    Round {activeRound + 1} of {g4Words.length}
                  </div>
                </div>

                {/* Display active word */}
                <div className="py-8 bg-amber-50/50 border-2 border-amber-200/50 rounded-3xl text-center shadow-inner relative overflow-hidden">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block mb-1">Read this word:</span>
                  <span className="text-5xl sm:text-6xl font-black text-teal-950 select-none tracking-wide block" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {g4Words[activeRound]}
                  </span>
                </div>

                {/* Mic & Audio Playback section */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 text-center space-y-4">
                  {!isRecording && !g4HasRecorded ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-16 h-16 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-teal-100 transition transform hover:scale-105 active:scale-95 cursor-pointer mx-auto"
                      >
                        <Mic className="w-7 h-7" />
                      </button>
                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-700 font-lexend block">Tap to Start Recording</span>
                        <span className="text-[10px] text-slate-400 font-medium font-lexend block">We will check your spelling pronunciation!</span>
                      </div>
                    </div>
                  ) : isRecording ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-rose-100 transition transform scale-105 cursor-pointer mx-auto border-4 border-rose-200 animate-pulse"
                      >
                        <MicOff className="w-7 h-7 animate-bounce" />
                      </button>
                      <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs font-black text-rose-600 font-lexend block animate-pulse">Recording... Speak Now!</span>
                        
                        {spokenText && (
                          <div className="mt-2 text-xs bg-indigo-50 border border-indigo-100/50 px-3 py-1.5 rounded-xl font-bold text-slate-700 max-w-xs mx-auto">
                            Hearing: <span className="text-indigo-600 italic">"{spokenText}"</span>
                          </div>
                        )}

                        <div className="flex justify-center gap-1 mt-2">
                          <div className="w-1 h-4 bg-rose-400 rounded-full animate-pulse" />
                          <div className="w-1 h-6 bg-rose-500 rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-4 bg-rose-400 rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl max-w-sm mx-auto flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">Voice Saved!</span>
                        
                        {spokenText ? (
                          <div className="text-xs font-lexend font-bold text-slate-700">
                            Heard: <span className="text-indigo-600 italic">"{spokenText}"</span>
                          </div>
                        ) : (
                          <div className="text-xs font-lexend text-slate-400 font-semibold italic">
                            (Audio saved successfully)
                          </div>
                        )}

                        <div className="flex items-center gap-3 w-full justify-center mt-1">
                          <button
                            type="button"
                            onClick={playRecording}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition select-none cursor-pointer"
                          >
                            <span>🔊 Listen to Recording</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={startRecording}
                            className="text-xs text-slate-500 hover:text-slate-700 font-bold bg-white px-3 py-2 border border-slate-200 rounded-xl transition cursor-pointer"
                          >
                            🔄 Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation/Submission Buttons */}
                <div className="space-y-2.5 pt-2">
                  {g4HasRecorded ? (
                    <button
                      id="g4-lock-in-btn"
                      onClick={() => handleGame4Tap()}
                      className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base font-black rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer select-none transform hover:scale-[1.01]"
                    >
                      Lock in & Next Word ➡️
                    </button>
                  ) : (
                    !isRecording && (
                      <button
                        type="button"
                        onClick={() => {
                          handleGame4Tap("(Skipped)");
                        }}
                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-black rounded-2xl transition cursor-pointer select-none"
                      >
                        Skip Recording & Next ➡️
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* GAME 5: PICK YOUR PATH 🗺️ */}
            {activeGame === 5 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>🗺️ Game 5: Pick Your Path Adventure</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Choose your reading adventure path today! Glance at these two friendly story styles. Which path feels more cozy and fun for you to read?
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg text-[11px] font-bold">
                    Adventure {activeRound + 1} of {g5Rounds.length}
                  </div>
                </div>

                {/* Side by side selections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Whimsical Valley (Simple Path) */}
                  <div 
                    onClick={() => handleGame5Choice('simple')}
                    className="border-4 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/40 hover:border-emerald-400 p-6 rounded-3xl space-y-5 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md transform hover:scale-[1.01] relative overflow-hidden group"
                  >
                    {/* Floating leaf background shapes */}
                    <div className="absolute top-2 right-2 text-3xl opacity-15 select-none pointer-events-none group-hover:scale-125 transition duration-300">🍃</div>
                    <div className="absolute bottom-2 left-2 text-2xl opacity-10 select-none pointer-events-none">🌿</div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-black font-lexend">
                          <span>🍏 Whimsical Valley Route</span>
                        </span>

                        {/* Read Aloud Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakTargetWord(g5Rounds[activeRound].simple, 0.70);
                          }}
                          className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition shadow-xs cursor-pointer"
                          title="Listen to Valley Route"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white/80 p-4 rounded-2xl border border-emerald-50 shadow-inner">
                        <p className="text-emerald-950 text-base leading-relaxed font-lexend font-bold tracking-wide text-center py-2">
                          "{g5Rounds[activeRound].simple}"
                        </p>
                      </div>
                      
                      <div className="flex justify-center gap-1.5 text-[11px] text-emerald-800 font-bold font-lexend">
                        <span>✨ Large clean spacing</span>
                        <span>•</span>
                        <span>🎈 Cozy phrasing</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs transition cursor-pointer select-none shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Choose Valley Path! 🌲</span>
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>

                  {/* Deep Cosmic (Complex Path) */}
                  <div 
                    onClick={() => handleGame5Choice('complex')}
                    className="border-4 border-indigo-100 bg-indigo-50/10 hover:bg-indigo-50/40 hover:border-indigo-400 p-6 rounded-3xl space-y-5 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md transform hover:scale-[1.01] relative overflow-hidden group"
                  >
                    {/* Floating space background shapes */}
                    <div className="absolute top-2 right-2 text-3xl opacity-15 select-none pointer-events-none group-hover:scale-125 transition duration-300">🚀</div>
                    <div className="absolute bottom-2 left-2 text-2xl opacity-10 select-none pointer-events-none">⭐</div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-black font-lexend">
                          <span>🍊 Stellar Cosmic Journey</span>
                        </span>

                        {/* Read Aloud Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakTargetWord(g5Rounds[activeRound].complex, 0.70);
                          }}
                          className="w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition shadow-xs cursor-pointer"
                          title="Listen to Cosmic Journey"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white/80 p-4 rounded-2xl border border-indigo-50 shadow-inner">
                        <p className="text-indigo-950 text-base leading-relaxed font-lexend font-semibold tracking-normal text-center py-2">
                          "{g5Rounds[activeRound].complex}"
                        </p>
                      </div>

                      <div className="flex justify-center gap-1.5 text-[11px] text-indigo-800 font-bold font-lexend">
                        <span>🚀 High details</span>
                        <span>•</span>
                        <span>💫 Wholesome vocabulary</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs transition cursor-pointer select-none shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Choose Cosmic Path! 🪐</span>
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GAME 6: HELPER STICKERS 🧑‍🏫 */}
            {activeGame === 6 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-lexend flex items-center justify-center gap-2">
                    <span>🌟 Game 6: Helper Stickers</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Final screen sticker! Pick the sticker that matches how you usually read books at school or home.
                  </p>
                </div>

                {/* Sticker choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <button
                    id="g6-sticker-helper"
                    onClick={() => handleGame6Choice('helper')}
                    className="p-6 bg-gradient-to-b from-purple-50/50 to-indigo-50/10 hover:from-purple-50 hover:to-indigo-50/30 border-2 border-purple-200/60 hover:border-purple-500 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition group shadow-xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-4xl shadow-inner transform group-hover:scale-110 transition duration-300">
                      🧑‍🏫
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 font-lexend">I read with a helper</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                        I love sounding out words together with my teacher, parents, or friends!
                      </p>
                    </div>
                  </button>

                  <button
                    id="g6-sticker-own"
                    onClick={() => handleGame6Choice('own')}
                    className="p-6 bg-gradient-to-b from-amber-50/50 to-orange-50/10 hover:from-amber-50 hover:to-orange-50/30 border-2 border-amber-200/60 hover:border-amber-500 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition group shadow-xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-4xl shadow-inner transform group-hover:scale-110 transition duration-300">
                      🌟
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 font-lexend">I read on my own</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                        I feel confident reading sentences and stories independently!
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* STEP 3: PLAYFUL RESULT VISUALS & DETAILED RECOMMENDATIONS */}
        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* MAIN RESULTS DISPLAY BOX */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Score Dial (Calm, Beautiful) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                  <div className="relative w-40 h-40 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#f8fafc"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke={
                          finalRisk === 'low' 
                            ? '#0d9488' // Teal-600
                            : finalRisk === 'mid' 
                              ? '#d97706' // Amber-600
                              : '#4f46e5' // Indigo-600
                        }
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - finalScore / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold font-lexend text-slate-800">
                        {finalScore}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                        Risk Score
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 px-3 py-1.5 border rounded-full text-xs font-black tracking-wide font-lexend text-center ${riskUI?.cardBg}`}>
                    {riskUI?.title}
                  </div>
                </div>

                {/* Score Narrative & Demographic details */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-lexend">
                      Gameplay Reading Style Assessment
                    </span>
                    <h3 className="text-3xl font-black text-slate-800 font-lexend mt-0.5">
                      {profile.name} (Age {profile.age} • {profile.grade})
                    </h3>
                  </div>

                  {/* Child-Friendly Total Gameplay Score Card */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl select-none">🏆</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 font-lexend">Total Gameplay Score</h4>
                        <p className="text-slate-500 text-[11px] font-lexend font-medium">All multiple-choice and pronunciation challenges completed!</p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 border border-amber-200 rounded-xl flex items-baseline gap-1 shadow-xs shrink-0 select-none">
                      <span className="text-2xl font-black text-amber-600 font-lexend animate-pulse">
                        {game1Results.filter(r => r.correct).length + game2Results.filter(r => r.correct).length + game3Results.filter(r => r.correct).length + game4Pronunciations.filter(r => r.correct).length}
                      </span>
                      <span className="text-slate-400 font-bold text-sm">/</span>
                      <span className="text-sm font-black text-slate-500 font-lexend">
                        {g1Rounds.length + g2Rounds.length + g3Rounds.length + g4Words.length}
                      </span>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border leading-relaxed text-sm ${riskUI?.cardBg} font-lexend font-semibold`}>
                    {riskUI?.subtitle}. Let's look at how the 6 different games help explain which reading tools can provide the best, most comfortable support for you.
                  </div>

                  {/* Benchmark Adjustment settings for Speedy Tap */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <label htmlFor="benchmark-slider" className="text-xs font-black text-slate-600 font-lexend block">
                        Reading Pace Benchmark Constant: <span className="text-teal-600 font-mono font-bold">{speedBenchmark.toFixed(1)}s</span> per word
                      </label>
                      <button
                        type="button"
                        onClick={() => calculateFinalResults(game6Result || 'own')}
                        className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition select-none"
                      >
                        Recalculate 🔄
                      </button>
                    </div>
                    <input
                      id="benchmark-slider"
                      type="range"
                      min="1.5"
                      max="4.5"
                      step="0.5"
                      value={speedBenchmark}
                      onChange={(e) => setSpeedBenchmark(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                      <span>1.5s (Fast)</span>
                      <span>2.5s (Default)</span>
                      <span>4.5s (Slow)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT THIS MIGHT MEAN (Generated bullets based on performance metrics) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-4">
              <h4 className="text-lg font-black text-slate-800 font-lexend flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                What this might mean for your reading style:
              </h4>

              <div className="grid grid-cols-1 gap-3.5 pt-1">
                {getPersonalizedBullets().map((bullet, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-slate-50/40 border border-slate-100 rounded-2xl flex items-start gap-3.5 hover:bg-slate-50 transition"
                  >
                    <span className="text-base shrink-0 mt-0.5 select-none">✨</span>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-lexend font-medium">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION INTEGRATION CARD: Try Reader Tool CTA */}
            <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/5 rounded-3xl border border-teal-100/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 fill-white" /> Recommended Reading Assistant
                  </div>
                  <h4 className="text-xl font-black text-slate-800 font-lexend">
                    Dyslexia-Optimized Reading Assistant
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-lexend">
                    Our specialized reader tool immediately implements the suggested accommodations. It offers widened spaces, syllable splits, custom colors (mint/cream), voice read-aloud speed limits, and the highlight focus ruler to make school text delightful.
                  </p>
                </div>
                
                <button
                  id="open-reader-assistant-btn"
                  onClick={() => onNavigateToReader()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl transition shadow-sm hover:shadow-md cursor-pointer shrink-0 font-lexend text-sm select-none"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Try the reader tool 📚</span>
                </button>
              </div>
            </div>

            {/* PRINT GAME DOCKET FOR EDUCATORS / PARENTS */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h4 className="text-md sm:text-lg font-black text-slate-800 font-lexend flex items-center gap-2">
                  <Printer className="w-5 h-5 text-slate-500" />
                  Educator's Game Play Docket
                </h4>
                <button
                  id="print-report-btn"
                  onClick={() => window.print()}
                  className="print:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs select-none"
                >
                  <span>Print PDF 📁</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs font-lexend">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wide">Player Name:</span>
                    <strong className="text-slate-800 text-sm">{profile.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wide">Age / Grade:</span>
                    <strong className="text-slate-800 text-sm">Age {profile.age} ({profile.grade})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wide">Risk Profile:</span>
                    <strong className={`text-sm uppercase ${
                      finalRisk === 'low' ? 'text-teal-600' : finalRisk === 'mid' ? 'text-amber-600' : 'text-indigo-600'
                    }`}>{finalRisk}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wide">Date Completed:</span>
                    <strong className="text-slate-800 text-sm">{new Date().toLocaleDateString()}</strong>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 font-lexend">
                    Gameplay Score Metrics Breakdown
                  </div>
                  <div className="p-4 space-y-3 font-lexend font-medium text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Game 1 - Letter Twins (Letter visual shapes)</span>
                      <strong className="text-slate-800">{scoresInfo.letterTwins}% accuracy</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Game 2 - Sound Match (Phonetic mapping)</span>
                      <strong className="text-slate-800">{scoresInfo.soundMatch}% accuracy</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Game 3 - Spell Snap (Orthographical recall)</span>
                      <strong className="text-slate-800">{scoresInfo.spellSnap}% accuracy</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Game 4 - Speedy Tap (Reading speed automaticity)</span>
                      <strong className="text-slate-800">{scoresInfo.speedyTapSeconds.toFixed(2)}s average</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Game 5 - Pick Your Path (Comfort tier choice)</span>
                      <strong className="text-slate-800">{scoresInfo.pickYourPathComplex} of {g5Rounds.length} complex paths</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Game 6 - Helper Sticker (Perceived reading support needs)</span>
                      <strong className="text-slate-800">{scoresInfo.helperChoice === 'own' ? "Independent Reader 🌟" : "Assisted Reader 🧑‍🏫"}</strong>
                    </div>
                  </div>
                </div>

                {/* MCQ & PRONUNCIATION RIGHT/WRONG REPORT CARD - Shown only at the end */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 font-lexend flex items-center justify-between">
                    <span>📝 Gameplay Round Report Card (All Games)</span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full font-black animate-pulse">All Games Completed!</span>
                  </div>
                  <div className="p-4 space-y-4 font-lexend font-medium">
                    {/* Game 1 MCQ summary */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-teal-800 text-xs">Game 1: Letter Twins</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {game1Results.map((res, i) => (
                          <div key={i} className={`p-2 rounded-xl border flex items-center justify-between ${res.correct ? 'bg-emerald-50 border-emerald-150 text-emerald-900' : 'bg-rose-50 border-rose-150 text-rose-900'}`}>
                            <span className="font-bold">Round {i + 1}</span>
                            <span className="text-[11px] font-black">{res.correct ? '✅ Right' : '❌ Wrong'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Game 2 MCQ summary */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <h5 className="font-bold text-teal-800 text-xs">Game 2: Sound Match</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {game2Results.map((res, i) => (
                          <div key={i} className={`p-2 rounded-xl border flex items-center justify-between ${res.correct ? 'bg-emerald-50 border-emerald-150 text-emerald-900' : 'bg-rose-50 border-rose-150 text-rose-900'}`}>
                            <span className="font-bold">Round {i + 1}</span>
                            <span className="text-[11px] font-black">{res.correct ? '✅ Right' : '❌ Wrong'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Game 3 MCQ summary */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <h5 className="font-bold text-teal-800 text-xs">Game 3: Spell Snap</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {game3Results.map((res, i) => (
                          <div key={i} className={`p-2 rounded-xl border flex items-center justify-between ${res.correct ? 'bg-emerald-50 border-emerald-150 text-emerald-900' : 'bg-rose-50 border-rose-150 text-rose-900'}`}>
                            <span className="font-bold">Round {i + 1}</span>
                            <span className="text-[11px] font-black">{res.correct ? '✅ Right' : '❌ Wrong'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Game 4 Pronunciation summary */}
                    {game4Pronunciations.length > 0 && (
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <h5 className="font-bold text-teal-800 text-xs">Game 4: Pronunciation Play</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {game4Pronunciations.map((res, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                res.correct 
                                  ? 'bg-emerald-50/70 border-emerald-150 text-emerald-900' 
                                  : 'bg-rose-50/70 border-rose-150 text-rose-900'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">Round {i + 1}: "{res.word}"</span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${res.correct ? 'bg-emerald-100/60' : 'bg-rose-100/60'}`}>
                                    {res.correct ? '✅ Right' : '❌ Wrong'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  Spoken: <span className="font-bold italic text-slate-700">"{res.spokenText}"</span>
                                </p>
                              </div>
                              {res.audioUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const audio = new Audio(res.audioUrl!);
                                    audio.play().catch(err => console.error(err));
                                  }}
                                  className="self-start sm:self-auto px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🔊 Listen Back</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DISCLAIMER SHEET - Bottom of results screen */}
            <div className="text-center pt-8 border-t border-slate-100">
              <p id="screener-disclaimer" className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed font-lexend">
                This is a fun way to learn more, not a medical diagnosis. Talk to a teacher or specialist if you have concerns. Scribl's games map preliminary visual and phoneme behaviors and are designed entirely to pair children with helpful on-screen accommodations.
              </p>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
      
    </div>
  );
}
