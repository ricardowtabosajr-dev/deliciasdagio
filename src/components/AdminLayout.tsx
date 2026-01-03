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

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Erro ao sair:", error);
            // Fallback navigation
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa] font-sans selection:bg-rose-100">
            {/* Sidebar Goumert */}
            <aside className="w-80 bg-white border-r border-rose-50 p-10 flex flex-col gap-12 sticky top-0 h-screen">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/admin')}>
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20 group-hover:scale-110 transition-transform duration-500">
                        <UtensilsCrossed size={22} className="animate-float" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase tracking-tighter text-xl leading-none">Delícias</span>
                        <span className="font-extrabold text-rose-600 uppercase tracking-widest text-[10px] leading-none">da Gio Admin</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Início"
                        active={location.pathname === '/admin'}
                        onClick={() => navigate('/admin')}
                    />
                    <SidebarItem
                        icon={Pizza}
                        label="Cardápio"
                        active={location.pathname.startsWith('/admin/products')}
                        onClick={() => navigate('/admin/products')}
                    />
                    <SidebarItem
                        icon={History}
                        label="Pedidos"
                        active={location.pathname === '/admin/orders'}
                        onClick={() => navigate('/admin/orders')}
                    />
                </nav>

                <div className="space-y-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">
                            Status da Loja
                        </p>
                        <button
                            onClick={() => updateStoreStatus(!storeConfig.isStoreOpen)}
                            disabled={dbSyncing}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-10 ${storeConfig.isStoreOpen
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-200 text-slate-600'
                                }`}
                        >
                            {dbSyncing ? <RefreshCcw className="animate-spin" size={14} /> : (
                                <>
                                    <div className={`w-2 h-2 rounded-full ${storeConfig.isStoreOpen ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></div>
                                    {storeConfig.isStoreOpen ? 'Loja Aberta' : 'Loja Fechada'}
                                </>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-5 text-slate-400 hover:text-rose-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        <LogOut size={16} /> Sair com Segurança
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-16 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
