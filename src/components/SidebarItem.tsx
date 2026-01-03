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
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active
                ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20 active:scale-95'
                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
            }`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            <Icon size={20} strokeWidth={active ? 3 : 2} />
        </div>
        <span className={`font-black uppercase text-[10px] tracking-[0.15em] transition-all ${active ? 'opacity-100 translate-x-1' : 'opacity-80'
            }`}>
            {label}
        </span>
        {active && (
            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"></div>
        )}
    </button>
);
