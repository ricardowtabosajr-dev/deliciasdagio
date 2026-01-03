import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    UtensilsCrossed, LayoutDashboard, Pizza, History, LogOut, RefreshCcw
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { storeConfig, dbSyncing, updateStoreStatus } = useStore();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <aside className="w-72 bg-white border-r p-8 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
                        <UtensilsCrossed size={20} />
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-tighter">Painel Gio</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={location.pathname === '/admin'}
                        onClick={() => navigate('/admin')}
                    />
                    <SidebarItem
                        icon={Pizza}
                        label="Cardápio"
                        active={location.pathname === '/admin/products'}
                        onClick={() => navigate('/admin/products')}
                    />
                    <SidebarItem
                        icon={History}
                        label="Pedidos"
                        active={location.pathname === '/admin/orders'}
                        onClick={() => navigate('/admin/orders')}
                    />
                </nav>

                <div className="p-4 bg-slate-50 rounded-2xl border">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Sincronização Cloud
                    </p>
                    <button
                        onClick={() => updateStoreStatus(!storeConfig.isStoreOpen)}
                        disabled={dbSyncing}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${storeConfig.isStoreOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                    >
                        {dbSyncing ? <RefreshCcw className="animate-spin" size={14} /> : (storeConfig.isStoreOpen ? 'Online' : 'Offline')}
                    </button>
                </div>

                <button
                    onClick={signOut}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                >
                    <LogOut size={14} /> Sair do Admin
                </button>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
};
