import React from 'react';
import { useStore } from '../../context/StoreContext';
import { STATUS_CONFIG } from '../../constants';
import { OrderStatus } from '../../types';

export const Orders: React.FC = () => {
    const { orders, updateOrderStatus, storeConfig } = useStore();

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        // Find the current order state before updating
        const order = orders.find(o => o.id === orderId);

        // WhatsApp notification logic
        if (newStatus === 'Saiu para entrega' && order) {
            const token = order.confirmationToken || order.id;
            const confirmUrl = `${window.location.protocol}//${window.location.host}/confirm?token=${token}`;

            const msg = `Olá ${order.customerName}! Seu pedido #${order.id} da ${storeConfig.storeName} saiu para entrega! 🛵💨\n\n*Por favor, clique no link abaixo para confirmar o recebimento quando o entregador chegar:*\n${confirmUrl}`;

            const cleanPhone = order.customerPhone.replace(/\D/g, '');
            window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
        }

        await updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Fila de Pedidos</h2>
                <p className="text-slate-400">Sincronizado em tempo real</p>
            </div>
            <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Cliente</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Total</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td className="px-10 py-6">
                                    <p className="font-black text-rose-400 text-xs">#{o.id}</p>
                                    <p className="font-bold">{o.customerName}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${o.deliveryMethod === 'Entrega' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {o.deliveryMethod || 'Entrega'}
                                        </span>
                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-widest">
                                            {o.paymentMethod || 'Pix'}
                                        </span>
                                        {o.troco && (
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase tracking-widest">
                                                Troco: R$ {o.troco.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-10 py-6 font-black">R$ {o.total.toFixed(2)}</td>
                                <td className="px-10 py-6">
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none ${STATUS_CONFIG[o.status].color}`}
                                    >
                                        {Object.keys(STATUS_CONFIG).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
