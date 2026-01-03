import React from 'react';

interface SidebarItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-rose-600 text-white shadow-lg shadow-indigo-200'
            : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
            }`}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={`font-medium ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </button>
);
