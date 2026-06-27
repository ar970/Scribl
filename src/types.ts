export interface ScreenerQuestion {
  id: number;
  text: string;
  subtext?: string;
}

export type ScreenerRating = 0 | 1 | 2 | 3 | 4;

export interface ScreenerResponse {
  [questionId: number]: ScreenerRating;
}

export type ScreenerRiskLevel = 'low' | 'mid' | 'high';

export interface ChildProfile {
  name: string;
  age: number;
  grade: string;
}

export interface ReaderSettings {
  fontSize: number; // in pixels
  letterSpacing: 'normal' | 'wide' | 'extra' | 'double';
  wordSpacing: 'normal' | 'wide' | 'extra' | 'double';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  fontFamily: 'lexend' | 'comic' | 'inter' | 'mono' | 'opendyslexic' | 'atkinson';
  theme: 'white' | 'cream' | 'yellow' | 'peach' | 'mint' | 'blue' | 'charcoal';
  overlayOpacity: number; // opacity of Irlen overlay, 0 to 0.4
  focusRuler: boolean;
  focusRulerHeight: 'narrow' | 'medium' | 'wide';
  focusRulerColor: 'yellow' | 'blue' | 'gray' | 'pink';
  syllableHighlight: 'none' | 'alternating' | 'vowels';
  speechRate: number; // 0.5 to 2.0
}

export interface LibraryPassage {
  id: string;
  title: string;
  source: string;
  gradeLevel: string;
  content: string;
  description: string;
}
