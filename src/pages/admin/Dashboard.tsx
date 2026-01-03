import React, { useMemo } from 'react';
import { TrendingUp, Pizza } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Dashboard: React.FC = () => {
    const { products, orders } = useStore();

    const stats = useMemo(() => {
        const totalSales = orders.reduce((acc, o) => o.status !== 'Cancelado' ? acc + o.total : acc, 0);
        const lowStock = products.filter(p => p.stock < 10).length;
        return { count: products.length, lowStock, totalSales };
    }, [products, orders]);

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Dashboard Cloud</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
                    <TrendingUp className="text-rose-600 mb-6" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Vendas (DB)</p>
                    <p className="text-4xl font-black text-slate-900">R$ {stats.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
                    <Pizza className="text-rose-600 mb-6" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Itens Ativos</p>
                    <p className="text-4xl font-black text-slate-900">{stats.count}</p>
                </div>
            </div>
        </div>
    );
};
