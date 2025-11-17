
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, noPadding = false }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-200 px-6 py-4 border-b border-slate-700">
        {title}
      </h2>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
