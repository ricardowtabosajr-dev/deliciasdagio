import React, { useMemo, useState } from 'react';
import { TrendingUp, Pizza, ShoppingBag, BarChart3, X, Award, Star, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

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

        return { revenue, avgTicket, bestSellers, completedCount: completedOrders.length };
    }, [orders]);

    const stats = [
        { label: 'Pedidos Total', value: orders.length, icon: ShoppingBag, color: 'bg-rose-500' },
        { label: 'Cardápio', value: products.length, icon: Pizza, color: 'bg-amber-500' },
        { label: 'Faturamento Total', value: `R$ ${metrics.revenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500' },
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
                        <p className="text-sm text-slate-400 font-medium">
                            Seu faturamento atingiu <span className="text-rose-600 font-bold">R$ {metrics.revenue.toFixed(2)}</span> com um ticket médio de <span className="text-rose-600 font-bold">R$ {metrics.avgTicket.toFixed(2)}</span>.
                        </p>
                    </div>
                    <button onClick={() => setShowReport(true)} className="btn-secondary">Ver Relatórios Detalhados</button>
                </div>

                <div className="gourmet-card p-10 h-[400px] bg-rose-600 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Dica da IA Gourmet</h4>
                        <p className="text-rose-100 text-lg leading-relaxed font-medium">
                            {metrics.bestSellers.length > 0 ? (
                                <>"O seu <span className="text-white font-black underline decoration-white/30 underline-offset-4">{metrics.bestSellers[0].name}</span> é um sucesso absoluto! Considere criar um combo especial com ele para aumentar ainda mais as vendas."</>
                            ) : (
                                <>"Hoje é um ótimo dia para promover o seu cardápio! Comece a vender para ver as primeiras análises de IA."</>
                            )}
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

            {/* Sales Analysis Modal */}
            {showReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowReport(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-rose-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
                                    <BarChart3 size={20} />
                                </div>
                                <h2 className="font-black text-slate-900 text-xl tracking-tighter uppercase">Relatório de Desempenho</h2>
                            </div>
                            <button onClick={() => setShowReport(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Real</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {metrics.revenue.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Pedidos Entregues: {metrics.completedCount}</p>
                                </div>
                                <div className="p-8 bg-rose-50/30 rounded-[2rem] border border-rose-100/50 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {metrics.avgTicket.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block">Por Pedido</p>
                                </div>
                            </div>

                            {/* Best Sellers */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-l-4 border-rose-400 pl-4">
                                    <Award size={20} className="text-rose-500" />
                                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">Top 5 Produtos Estrela</h3>
                                </div>

                                <div className="space-y-4">
                                    {metrics.bestSellers.length > 0 ? (
                                        metrics.bestSellers.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-white border border-rose-50 rounded-[1.5rem] hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 font-black rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-100 transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 tracking-tight italic">{item.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.qty} unidades vendidas</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900">R$ {item.revenue.toFixed(2)}</p>
                                                    <div className="flex justify-end gap-0.5 text-rose-400">
                                                        {Array.from({ length: 5 - i }).map((_, k) => <Star key={k} size={10} fill="currentColor" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-2">
                                            <p className="text-slate-400 italic font-medium">Nenhuma venda realizada ainda.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-rose-50">
                            <button
                                onClick={() => setShowReport(false)}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
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
