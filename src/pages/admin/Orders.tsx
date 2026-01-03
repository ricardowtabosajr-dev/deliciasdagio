import React from 'react';
import { useStore } from '../../context/StoreContext';
import { STATUS_CONFIG } from '../../constants';
import { OrderStatus } from '../../types';

import {
    Clock, Package, MapPin, Receipt, MessageCircle, RefreshCcw, ShoppingBag, ChevronRight
} from 'lucide-react';

export const Orders: React.FC = () => {
    const { orders, updateOrderStatus, storeConfig, dbSyncing } = useStore();

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);

        if (newStatus === 'Saiu para entrega' && order) {
            const token = order.confirmationToken || order.id;
            const confirmUrl = `${window.location.protocol}//${window.location.host}/confirm?token=${token}`;
            const msg = `Olá ${order.customerName}! Seu pedido #${order.id.slice(0, 5)} da ${storeConfig.storeName} saiu para entrega! 🛵💨\n\n*Por favor, clique no link abaixo para confirmar o recebimento quando o entregador chegar:*\n${confirmUrl}`;

            const cleanPhone = order.customerPhone.replace(/\D/g, '');
            window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
        }

        await updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Operação</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Fila de Pedidos</h1>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-rose-50 rounded-2xl shadow-sm">
                    <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tempo Real Ativo</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {orders.length === 0 ? (
                    <div className="gourmet-card p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <ShoppingBag size={48} className="text-slate-300" strokeWidth={1} />
                        <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Nenhum pedido no momento</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="gourmet-card bg-white hover:border-rose-100 transition-all duration-500 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-rose-50">
                            {/* Order Header & Status */}
                            <div className="p-8 lg:w-80 flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{order.customerName}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${order.deliveryMethod === 'Entrega' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                                            }`}>
                                            {order.deliveryMethod || 'Entrega'}
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                                            {order.paymentMethod || 'Pix'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Progresso do Pedido</label>
                                    <div className="relative">
                                        <select
                                            value={order.status}
                                            disabled={dbSyncing}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className={`w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none border-2 transition-all cursor-pointer ${STATUS_CONFIG[order.status]?.color?.includes('bg-emerald') ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' :
                                                    STATUS_CONFIG[order.status]?.color?.includes('bg-rose') ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' :
                                                        STATUS_CONFIG[order.status]?.color?.includes('bg-amber') ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' :
                                                            'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                }`}
                                        >
                                            {Object.keys(STATUS_CONFIG).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <RefreshCcw size={12} className={dbSyncing ? 'animate-spin' : ''} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-8 flex-1 bg-slate-50/30">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Package size={16} className="text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens do Pedido</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-rose-50/50 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">{item.qty}x</span>
                                                    <span className="font-bold text-slate-700 text-sm italic">{item.name}</span>
                                                </div>
                                                <span className="font-black text-slate-400 text-xs">R$ {(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Total & Actions */}
                            <div className="p-8 lg:w-72 flex flex-col justify-between space-y-8 bg-white">
                                <div className="text-right space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a Receber</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {order.total.toFixed(2)}</p>
                                    </div>
                                    {order.troco && (
                                        <div className="inline-block px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 border-dashed">
                                            <p className="text-[9px] font-black uppercase tracking-widest">Trazer Troco</p>
                                            <p className="font-black">R$ {order.troco.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            const cleanPhone = order.customerPhone.replace(/\D/g, '');
                                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                        }}
                                        className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all group"
                                    >
                                        <MessageCircle size={16} className="group-hover:animate-bounce" /> WhatsApp
                                    </button>
                                    <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                                        <Receipt size={16} /> Ver Recibo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
