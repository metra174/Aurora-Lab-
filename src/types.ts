
export interface MusicCreationParams {
  prompt: string;
  lyrics: string;
  voice: VoiceOptions;
  beat: BeatOptions;
  pro: ProControls;
  mode: CreationMode;
}

export interface VoiceOptions {
  // Fix: Moved 'Epic' from gender to emotion to correct the type definition.
  gender: 'Male' | 'Female' | 'Robotic' | 'Angelic' | 'Dark';
  timbre: 'Smooth' | 'Raspy' | 'Clear' | 'Breathy';
  // Fix: Added 'Epic' to emotions to allow its use and fix the error in App.tsx.
  emotion: 'Happy' | 'Sad' | 'Aggressive' | 'Romantic' | 'Spiritual' | 'Epic';
  autotune: 'Natural' | 'Light' | 'Medium' | 'Heavy';
}

export interface BeatOptions {
  style: string; // From BEAT_STYLES constant
}

export interface ProControls {
  bpm: number;
  key: string; // From MUSIC_KEYS constant
  harmony: 'Simple' | 'Complex';
  intensity: number; // 0-100
  atmosphere: string; // From ATMOSPHERES constant
}

export enum CreationMode {
  Standard = 'Standard',
  Infinite = 'Creative Infinite',
  Producer = 'Pro Producer',
  Cover = 'Immersive Cover',
}

export interface GeneratedStem {
  name: string;
  url: string;
}

export interface GeneratedMusic {
  title: string;
  finalTrackUrl: string;
  lyrics: string;
  stems: GeneratedStem[];
  waveform: number[];
  arrangement: string;
  bandlabUrl: string;
  alternativeVersions: { name: string; url: string }[];
}
