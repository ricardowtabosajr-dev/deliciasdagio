import React, { useMemo, useState } from 'react';
import { TrendingUp, Pizza, ShoppingBag, BarChart3, X, Award, Star, DollarSign, Activity, CreditCard, Wallet, Banknote, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { STATUS_CONFIG } from '../../constants';

export const Dashboard: React.FC = () => {
    const { products, orders, storeConfig, loading } = useStore();
    const [showReport, setShowReport] = useState(false);

    const metrics = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'Entregue');
        const revenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
        const avgTicket = completedOrders.length > 0 ? revenue / completedOrders.length : 0;

        // Calculate best sellers
        const productSales: Record<string, { qty: number, revenue: number }> = {};
        completedOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = { qty: 0, revenue: 0 };
                }
                productSales[item.name].qty += item.qty;
                productSales[item.name].revenue += item.qty * item.price;
            });
        });

        const bestSellers = Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // Daily Trend (Last 7 Days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const dayRevenue = completedOrders
                .filter(o => new Date(o.timestamp).toDateString() === date.toDateString())
                .reduce((acc, o) => acc + o.total, 0);
            return { label: dayStr, value: dayRevenue };
        });

        // Payment Distribution
        const paymentDist = completedOrders.reduce((acc: Record<string, number>, o) => {
            const method = o.paymentMethod || 'Pix';
            acc[method] = (acc[method] || 0) + o.total;
            return acc;
        }, {});

        // Recent Orders
        const recentOrders = [...orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);

        const maxDayRevenue = Math.max(...last7Days.map(d => d.value), 100);

        return {
            revenue,
            avgTicket,
            bestSellers,
            completedCount: completedOrders.length,
            dailyTrend: last7Days,
            maxDayRevenue,
            paymentDist,
            recentOrders
        };
    }, [orders]);

    const stats = [
        { label: 'Volume de Pedidos', value: orders.length, icon: ShoppingBag, color: 'bg-rose-500', trend: '+12% este mês' },
        { label: 'Itens de Menu', value: products.length, icon: Pizza, color: 'bg-amber-500', trend: 'Cardápio Ativo' },
        { label: 'Receita Total', value: `R$ ${metrics.revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-500', trend: `Média R$ ${metrics.avgTicket.toFixed(2)}` },
    ];

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em]">Intelligence Center</p>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Painel de Controle</h1>
                    <p className="text-slate-400 font-medium text-sm">Bem-vinda de volta, Gio! Aqui estão as métricas da sua operação.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white border border-rose-50 rounded-3xl shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${storeConfig.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {storeConfig.isStoreOpen ? 'Operação Online' : 'Operação Offline'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="gourmet-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                            <stat.icon size={100} strokeWidth={3} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Trends & Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-8 gourmet-card p-10 flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tendência Semanal</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento dos últimos 7 dias</p>
                        </div>
                        <button onClick={() => setShowReport(true)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                            <Activity size={18} />
                        </button>
                    </div>

                    <div className="flex items-end justify-between h-48 gap-4 pt-4">
                        {metrics.dailyTrend.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="relative w-full flex-1 flex flex-col justify-end">
                                    <div
                                        style={{ height: `${(day.value / metrics.maxDayRevenue) * 100}%` }}
                                        className="w-full bg-slate-100 rounded-xl group-hover:bg-rose-500 transition-all duration-500 relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            R${day.value.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* IA Gourmet & Distribution */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="gourmet-card p-10 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Star size={16} fill="white" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest">IA Insight</h4>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                {metrics.bestSellers.length > 0 ? (
                                    <>O seu <span className="text-white font-black">{metrics.bestSellers[0].name}</span> está vendendo <span className="text-rose-400">muito bem</span>. Que tal um destaque no cardápio?</>
                                ) : (
                                    <>Aguardando novas vendas para gerar seu primeiro insight de lucro.</>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="gourmet-card p-8 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Métodos de Recebimento</h4>
                        <div className="space-y-3">
                            {Object.entries(metrics.paymentDist).map(([name, val], i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                                            {name === 'Pix' ? <Wallet size={14} className="opacity-60" /> : name === 'Cartão' ? <CreditCard size={14} className="opacity-60" /> : <Banknote size={14} className="opacity-60" />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">R$ {(val as number).toFixed(2)}</span>
                                </div>
                            ))}
                            {Object.keys(metrics.paymentDist).length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">Nenhum recebimento registrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Activity Feed & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Feed */}
                <div className="gourmet-card p-10 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Atividade Recente</h4>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-widest">Live Feed</span>
                    </div>
                    <div className="space-y-6">
                        {metrics.recentOrders.length > 0 ? (
                            metrics.recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${STATUS_CONFIG[order.status]?.color?.includes('bg-emerald') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                        STATUS_CONFIG[order.status]?.color?.includes('bg-rose') ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                            'bg-slate-50 border-slate-100 text-slate-400'
                                        }`}>
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{order.customerName}</p>
                                            <span className="font-black text-slate-900 text-xs">R$ {(order.total as number).toFixed(2)}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.status} • {new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center space-y-2 opacity-50">
                                <Activity size={32} className="mx-auto text-slate-300" />
                                <p className="text-[10px] font-black uppercase text-slate-400">Nenhuma atividade hoje</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Simplified Analytics Preview */}
                <div className="gourmet-card p-10 bg-white border-2 border-slate-100 flex flex-col justify-between items-center text-center space-y-6">
                    <div className="p-8 bg-slate-50 rounded-full text-slate-400">
                        <BarChart3 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Relatórios Profissionais</h4>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Visualize o desempenho completo dos seus produtos estrela e faturamento total.</p>
                    </div>
                    <button onClick={() => setShowReport(true)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200">
                        Acessar Relatório Completo
                    </button>
                </div>
            </div>

            {/* Sales Analysis Modal */}
            {showReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowReport(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-rose-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center border border-rose-100">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-black text-slate-900 text-2xl tracking-tighter uppercase leading-none">Desempenho Profissional</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baseado em {metrics.completedCount} pedidos entregues</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReport(false)} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-12 space-y-12 max-h-[70vh] overflow-y-auto">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Real</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {metrics.revenue.toFixed(2)}</p>
                                </div>
                                <div className="p-10 bg-rose-50/50 rounded-[3rem] border border-rose-100 space-y-2">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Ticket Médio</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {metrics.avgTicket.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Best Sellers */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 border-l-8 border-rose-500 pl-6">
                                    <Award size={24} className="text-rose-500" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ranking de Popularidade</h3>
                                </div>

                                <div className="space-y-4">
                                    {metrics.bestSellers.length > 0 ? (
                                        metrics.bestSellers.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-8 bg-white border border-rose-50 rounded-[2.5rem] hover:shadow-xl hover:-translate-y-1 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 font-black rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase tracking-tight italic text-lg">{item.name}</p>
                                                        <p className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full inline-block mt-1">{item.qty} unidades vendidas</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900 text-xl tracking-tighter">R$ {item.revenue.toFixed(2)}</p>
                                                    <div className="flex justify-end gap-1 text-amber-400 mt-2">
                                                        {Array.from({ length: 5 - i }).map((_, k) => <Star key={k} size={12} fill="currentColor" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-4 opacity-50">
                                            <BarChart3 size={48} className="mx-auto text-slate-200" />
                                            <p className="text-slate-400 italic font-medium">Os dados aparecerão aqui após as primeiras vendas entregues.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50 border-t border-rose-50">
                            <button
                                onClick={() => setShowReport(false)}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest hover:bg-rose-600 transition-all shadow-2xl shadow-slate-200 scale-100 active:scale-95"
                            >
                                Fechar Análise
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
