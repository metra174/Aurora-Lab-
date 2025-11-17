
import React from 'react';

interface SelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange, disabled = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};