
import React, { useState, useRef } from 'react';
import type { MusicCreationParams, VoiceOptions, BeatOptions, ProControls } from '../types';
import { CreationMode } from '../types';
import { BEAT_STYLES, MUSIC_KEYS, ATMOSPHERES, VOICE_GENDERS, VOICE_TIMBRES, VOICE_EMOTIONS, VOICE_AUTOTUNE, HARMONY_OPTIONS } from '../constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { TabButton } from './ui/TabButton';

interface CreationFormProps {
  initialState: MusicCreationParams;
  onGenerate: (params: MusicCreationParams) => void;
  isLoading: boolean;
}

export const CreationForm: React.FC<CreationFormProps> = ({ initialState, onGenerate, isLoading }) => {
  const [params, setParams] = useState<MusicCreationParams>(initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateParams = <K extends keyof MusicCreationParams>(key: K, value: MusicCreationParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = <T extends keyof MusicCreationParams, K extends keyof MusicCreationParams[T]>(
    parentKey: T,
    childKey: K,
    value: MusicCreationParams[T][K]
  ) => {
    setParams(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(params);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateParams('vocalSample', file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="1. Main Idea">
        <input
          type="text"
          value={params.prompt}
          onChange={(e) => updateParams('prompt', e.target.value)}
          placeholder="e.g., Afro house with angelic female vocals"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <textarea
          value={params.lyrics}
          onChange={(e) => updateParams('lyrics', e.target.value)}
          placeholder="Or paste your lyrics here... (Optional, AI can write for you)"
          rows={4}
          className="mt-4 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </Card>
      
      <Card title="2. Creation Mode">
        <div className="flex flex-wrap gap-2">
            {Object.values(CreationMode).map(mode => (
                 <TabButton key={mode} active={params.mode === mode} onClick={() => updateParams('mode', mode)}>
                    {mode}
                 </TabButton>
            ))}
        </div>
      </Card>

      {params.mode === CreationMode.VocalClone && (
        <Card title="🎤 Vocal Clone Sample">
            <div className="text-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/wav, audio/mpeg, audio/m4a"
                    className="hidden"
                />
                {!params.vocalSample ? (
                    <>
                        <p className="text-gray-400 mb-2">Upload a 5-10 second vocal sample (.wav, .mp3).</p>
                        <button type="button" onClick={triggerFileSelect} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                            Select Audio File
                        </button>
                    </>
                ) : (
                    <div className="flex items-center justify-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-gray-300 font-medium truncate">{params.vocalSample.name}</p>
                        <button type="button" onClick={() => updateParams('vocalSample', null)} className="text-red-500 hover:text-red-400 font-bold text-xl leading-none -mt-1">&times;</button>
                    </div>
                )}
            </div>
        </Card>
      )}

      <Card title="3. Voice Style">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Gender" value={params.voice.gender} onChange={(v) => updateNested('voice', 'gender', v as VoiceOptions['gender'])} options={VOICE_GENDERS} disabled={params.mode === CreationMode.VocalClone} />
          <Select label="Timbre" value={params.voice.timbre} onChange={(v) => updateNested('voice', 'timbre', v as VoiceOptions['timbre'])} options={VOICE_TIMBRES} disabled={params.mode === CreationMode.VocalClone} />
          <Select label="Emotion" value={params.voice.emotion} onChange={(v) => updateNested('voice', 'emotion', v as VoiceOptions['emotion'])} options={VOICE_EMOTIONS} />
          <Select label="Autotune" value={params.voice.autotune} onChange={(v) => updateNested('voice', 'autotune', v as VoiceOptions['autotune'])} options={VOICE_AUTOTUNE} />
        </div>
        {params.mode === CreationMode.VocalClone && (
            <p className="text-xs text-gray-400 mt-3 text-center">Gender and Timbre will be derived from your uploaded sample.</p>
        )}
      </Card>

      <Card title="4. Beat & Atmosphere">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Beat Style" value={params.beat.style} onChange={(v) => updateNested('beat', 'style', v as BeatOptions['style'])} options={BEAT_STYLES} />
          <Select label="Atmosphere" value={params.pro.atmosphere} onChange={(v) => updateNested('pro', 'atmosphere', v as ProControls['atmosphere'])} options={ATMOSPHERES} />
        </div>
      </Card>

      <Card title="5. Professional Controls">
        <div className="space-y-4">
          <Slider label="BPM" value={params.pro.bpm} min={30} max={250} onChange={(v) => updateNested('pro', 'bpm', v)} />
          <Slider label="Intensity" value={params.pro.intensity} min={0} max={100} onChange={(v) => updateNested('pro', 'intensity', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Key" value={params.pro.key} onChange={(v) => updateNested('pro', 'key', v as ProControls['key'])} options={MUSIC_KEYS} />
            <Select label="Harmony" value={params.pro.harmony} onChange={(v) => updateNested('pro', 'harmony', v as ProControls['harmony'])} options={HARMONY_OPTIONS} />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 py-4 bg-gray-900/80 backdrop-blur-sm">
         <Button type="submit" isLoading={isLoading}>
          {isLoading ? 'Creating Magic...' : 'Generate Music'}
        </Button>
      </div>
    </form>
  );
};