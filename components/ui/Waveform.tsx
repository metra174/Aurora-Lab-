
import React from 'react';

interface WaveformProps {
  data: number[];
}

export const Waveform: React.FC<WaveformProps> = ({ data }) => {
  const width = 500;
  const height = 100;
  const barWidth = width / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="waveformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barHeight = d * height;
        const y = (height - barHeight) / 2;
        return (
          <rect
            key={i}
            x={i * barWidth}
            y={y}
            width={barWidth - 1}
            height={barHeight}
            fill="url(#waveformGradient)"
            rx="1"
          />
        );
      })}
    </svg>
  );
};
