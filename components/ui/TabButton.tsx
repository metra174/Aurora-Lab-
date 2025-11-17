
import React from 'react';

interface TabButtonProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ children, active, onClick }) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500";
    const activeClasses = "bg-blue-600 text-white shadow-md";
    const inactiveClasses = "bg-slate-700/50 text-gray-300 hover:bg-slate-700";

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};
