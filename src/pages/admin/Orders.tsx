import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { STATUS_CONFIG } from '../../constants';
import { OrderStatus, Order } from '../../types';

import {
    Clock, Package, MapPin, Receipt, MessageCircle, RefreshCcw, ShoppingBag, ChevronRight, Truck, UtensilsCrossed, X, Printer, History
} from 'lucide-react';

export const Orders: React.FC = () => {
    const { orders, updateOrderStatus, storeConfig, dbSyncing } = useStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');

    const filteredOrders = orders.filter(order => {
        const isCompleted = order.status === 'Entregue' || order.status === 'Cancelado';
        return activeTab === 'ativos' ? !isCompleted : isCompleted;
    });

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrderStatus(orderId, newStatus);
    };

    const sendWhatsApp = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    const notifyOrderUpdate = (order: any, type: 'recebido' | 'preparo' | 'entrega') => {
        let msg = '';
        const greeting = `Olá ${order.customerName}! `;
        const orderIdShort = order.id.slice(0, 5);

        if (type === 'recebido') {
            msg = `${greeting}Confirmamos o recebimento do seu pedido #${orderIdShort} da ${storeConfig.storeName}! Já vamos começar a cuidar dele com todo carinho. 🌹✨`;
        } else if (type === 'preparo') {
            msg = `${greeting}Boas notícias! Seu pedido #${orderIdShort} já entrou em preparo na nossa cozinha! 🍳🔥 Jajá sai para você.`;
        } else if (type === 'entrega') {
            const token = order.confirmationToken || order.id;
            const confirmUrl = `${window.location.protocol}//${window.location.host}/confirm?token=${token}`;
            msg = `${greeting}Seu pedido #${orderIdShort} está a caminho! 🛵💨\n\n*Clique no link abaixo para confirmar o recebimento na entrega:*\n${confirmUrl}`;
        }

        sendWhatsApp(order.customerPhone, msg);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Operação</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Fila de Pedidos</h1>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1">
                    <button
                        onClick={() => setActiveTab('ativos')}
                        className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ativos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Fila de Produção
                    </button>
                    <button
                        onClick={() => setActiveTab('historico')}
                        className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Histórico
                    </button>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-rose-50 rounded-2xl shadow-sm">
                    <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tempo Real Ativo</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="gourmet-card p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        {activeTab === 'ativos' ? (
                            <ShoppingBag size={48} className="text-slate-300" strokeWidth={1} />
                        ) : (
                            <History size={48} className="text-slate-300" strokeWidth={1} />
                        )}
                        <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">
                            {activeTab === 'ativos' ? 'Nenhum pedido em produção' : 'Histórico de pedidos vazio'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
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
                                    {order.customerAddress && (
                                        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-3">
                                            <MapPin size={16} className="text-rose-400 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Endereço de Entrega</p>
                                                <p className="text-slate-600 font-medium text-xs">{order.customerAddress}</p>
                                            </div>
                                        </div>
                                    )}

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
                                    {order.status === 'Recebido' && (
                                        <button
                                            onClick={() => notifyOrderUpdate(order, 'recebido')}
                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                                        >
                                            <Package size={16} /> Notificar Recebimento
                                        </button>
                                    )}
                                    {order.status === 'Em preparo' && (
                                        <button
                                            onClick={() => notifyOrderUpdate(order, 'preparo')}
                                            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all"
                                        >
                                            <UtensilsCrossed size={16} /> Notificar Preparo
                                        </button>
                                    )}
                                    {order.status === 'Saiu para entrega' && (
                                        <button
                                            onClick={() => notifyOrderUpdate(order, 'entrega')}
                                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all animate-bounce-slow"
                                        >
                                            <Truck size={16} /> Enviar Link de Entrega
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const cleanPhone = order.customerPhone.replace(/\D/g, '');
                                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                        }}
                                        className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all group"
                                    >
                                        <MessageCircle size={16} className="group-hover:animate-bounce" /> WhatsApp do Cliente
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                    >
                                        <Receipt size={16} /> Ver Recibo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Receipt Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-rose-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
                                    <Receipt size={20} />
                                </div>
                                <h2 className="font-black text-slate-900 text-xl tracking-tighter uppercase">Recibo do Pedido</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Receipt Content */}
                        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
                            {/* Header / Store Info */}
                            <div className="text-center space-y-2 pb-8 border-b border-dashed border-slate-200">
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{storeConfig.storeName}</h1>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Pedido #{selectedOrder.id.slice(0, 8)}</p>
                                <p className="text-slate-400 text-xs font-medium italic">{new Date(selectedOrder.timestamp).toLocaleString('pt-BR')}</p>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-rose-200 pl-3">Destinatário</p>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-900 uppercase tracking-tight">{selectedOrder.customerName}</p>
                                    <p className="text-slate-500 text-xs">{selectedOrder.customerPhone}</p>
                                    {selectedOrder.customerAddress && (
                                        <p className="text-slate-500 text-xs pt-1">{selectedOrder.customerAddress}</p>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-rose-200 pl-3">Produtos</p>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-sm leading-tight italic">{item.qty}x {item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Preço unitário: R$ {item.price.toFixed(2)}</p>
                                            </div>
                                            <p className="font-black text-slate-900 text-sm">R$ {(item.qty * item.price).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-dashed border-slate-200 space-y-2">
                                    <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>R$ {selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600 text-xl font-black uppercase tracking-tighter">
                                        <span>Total Geral</span>
                                        <span>R$ {selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Logistics */}
                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-200">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pagamento</p>
                                    <p className="text-xs font-black text-slate-900 uppercase italic">{selectedOrder.paymentMethod || 'Pix'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</p>
                                    <p className="text-xs font-black text-slate-900 uppercase italic">{selectedOrder.deliveryMethod || 'Entrega'}</p>
                                </div>
                                {selectedOrder.troco && (
                                    <div className="col-span-2 p-4 bg-rose-50 rounded-2xl border border-rose-100 border-dashed text-rose-600">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Troco Necessário</p>
                                        <p className="text-xl font-black">R$ {selectedOrder.troco.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer / Action */}
                        <div className="p-8 bg-slate-50 border-t border-rose-50 flex gap-4">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
                            >
                                <Printer size={16} /> Imprimir Recibo
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
