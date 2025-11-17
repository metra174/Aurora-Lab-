
import React from 'react';
import type { GeneratedMusic } from '../types';
import { Card } from './ui/Card';
import { Waveform } from './ui/Waveform';
import { DownloadIcon } from './ui/Icons';

interface ResultsDisplayProps {
  music: GeneratedMusic | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-24 bg-gray-700 rounded-lg"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
    </div>
    <div className="h-40 bg-gray-700 rounded-lg"></div>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 rounded-lg p-8">
     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
    <h3 className="text-xl font-semibold text-gray-400">Your masterpiece awaits</h3>
    <p className="mt-2 max-w-sm">Fill in the details on the left and click "Generate Music" to bring your vision to life.</p>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ music, isLoading, error }) => {
  return (
    <div className="sticky top-8 h-[calc(100vh-4rem)]">
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-xl p-6 h-full overflow-y-auto">
        {isLoading && <LoadingSkeleton />}
        {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
        {!isLoading && !error && !music && <InitialState />}
        {!isLoading && !error && music && (
          <div className="space-y-6">
            <Card title={music.title} noPadding>
              <div className="p-4">
                 <audio controls src={music.finalTrackUrl} className="w-full">
                    Your browser does not support the audio element.
                </audio>
                <div className="mt-4 h-24 w-full">
                    <Waveform data={music.waveform} />
                </div>
              </div>
            </Card>

            <Card title="Lyrics">
              <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">{music.lyrics}</pre>
            </Card>

            <Card title="Stems & Downloads">
                <ul className="space-y-2">
                    {music.stems.map(stem => (
                        <li key={stem.name} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md">
                            <span className="text-sm">{stem.name}</span>
                            <a href={stem.url} download className="text-blue-400 hover:text-blue-300 transition-colors">
                                <DownloadIcon />
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 border-t border-gray-700 pt-4 flex flex-wrap gap-4">
                    <a href={music.bandlabUrl} className="flex items-center gap-2 text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-md hover:bg-yellow-500/30 transition-colors"> <DownloadIcon /> Demo for BandLab</a>
                    {music.alternativeVersions.map(v => (
                         <a key={v.name} href={v.url} className="flex items-center gap-2 text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-md hover:bg-indigo-500/30 transition-colors"> <DownloadIcon /> {v.name}</a>
                    ))}
                </div>
            </Card>
            
            <Card title="Arrangement">
              <p className="text-sm text-gray-400">{music.arrangement}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
