
import React, { useState, useCallback } from 'react';
import { CreationForm } from './components/CreationForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { generateMusic } from './services/geminiService';
import type { MusicCreationParams, GeneratedMusic } from './types';
import { CreationMode } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (params: MusicCreationParams) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMusic(null);
    try {
      const result = await generateMusic(params);
      setGeneratedMusic(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the music. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initialParams: MusicCreationParams = {
    prompt: 'An epic cinematic track about space exploration',
    lyrics: '',
    voice: {
      gender: 'Female',
      timbre: 'Clear',
      emotion: 'Epic',
      autotune: 'Light',
    },
    beat: {
      style: 'Cinematic',
    },
    pro: {
      bpm: 120,
      key: 'C Minor',
      harmony: 'Complex',
      intensity: 80,
      atmosphere: 'Futuristic',
    },
    mode: CreationMode.Standard,
    vocalSample: null,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CreationForm
            initialState={initialParams}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <ResultsDisplay
            music={generatedMusic}
            isLoading={isLoading}
            error={error}
          />
        </main>
      </div>
    </div>
  );
};

export default App;