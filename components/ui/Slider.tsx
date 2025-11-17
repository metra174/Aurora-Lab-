
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono bg-gray-700/50 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
};
