import React, { useMemo } from 'react';
import { TrendingUp, Pizza, ShoppingBag, BarChart3 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Dashboard: React.FC = () => {
    const { products, orders, storeConfig, loading } = useStore();

    const stats = [
        { label: 'Pedidos Total', value: orders.length, icon: ShoppingBag, color: 'bg-rose-500' },
        { label: 'Cardápio', value: products.length, icon: Pizza, color: 'bg-amber-500' },
        { label: 'Vendas Hoje', value: `R$ ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500' },
    ];

    if (loading) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Visão Geral</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Painel de Controle</h1>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-rose-50 rounded-2xl shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${storeConfig.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {storeConfig.isStoreOpen ? 'Operação Online' : 'Operação Offline'}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="gourmet-card p-10 relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                            <stat.icon size={80} strokeWidth={3} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="gourmet-card p-10 h-[400px] flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                        <BarChart3 size={32} />
                    </div>
                    <div className="max-w-xs">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Análise de Vendas</h4>
                        <p className="text-sm text-slate-400 font-medium">Relatórios detalhados de desempenho e produtos mais vendidos estarão disponíveis em breve.</p>
                    </div>
                    <button className="btn-secondary">Ver Relatórios</button>
                </div>

                <div className="gourmet-card p-10 h-[400px] bg-rose-600 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Dica da IA Gourmet</h4>
                        <p className="text-rose-100 text-lg leading-relaxed font-medium">
                            "Hoje é um ótimo dia para promover o seu <span className="text-white font-black underline decoration-white/30 underline-offset-4">X-Tudo Especial</span>! Temos um aumento de tráfego nos fins de semana."
                        </p>
                    </div>
                    <div className="relative z-10 p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-lg">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">+15% de engajamento sugerido</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
