import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    UtensilsCrossed, Lock, ShoppingBag, Plus, Send, X, Pizza, Search, CheckCircle, MapPin, Phone, MessageCircle, Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../constants';
import { Product, CartItem } from '../types';
import { supabase } from '../services/supabase';

export const PublicHome: React.FC = () => {
    const { products, storeConfig, dbSyncing, setDbSyncing, orders, setOrders } = useStore();
    const { isAdminAuth } = useAuth();
    const navigate = useNavigate();
    const menuSectionRef = useRef<HTMLElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        name: '',
        phone: '',
        address: '',
        payment: 'Pix',
        delivery: 'Entrega' as 'Entrega' | 'Retirada',
        troco: ''
    });

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, activeCategory]);

    const handleCategorySelect = (category: string) => {
        setActiveCategory(category);
        if (menuSectionRef.current) {
            const offset = 140;
            const elementPosition = menuSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
    };

    const addToCart = (product: Product) => {
        if (!storeConfig.isStoreOpen) return;
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const sendWhatsAppOrder = async () => {
        if (!checkoutData.name || !checkoutData.address || !checkoutData.phone) {
            alert("Preencha todos os campos!");
            return;
        }
        if (!supabase) {
            alert("Erro de conexão com o banco de dados.");
            return;
        }

        setDbSyncing(true);
        const cartTotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);
        const orderId = Math.random().toString(36).substr(2, 5).toUpperCase();
        const confirmationToken = crypto.randomUUID();

        const dbOrder = {
            id: orderId,
            customer_name: checkoutData.name,
            customer_phone: checkoutData.phone.replace(/\D/g, ''),
            items: cart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.sellPrice })),
            total: cartTotal,
            timestamp: Date.now(),
            status: 'Pendente',
            confirmation_token: confirmationToken,
            payment_method: checkoutData.payment,
            delivery_method: checkoutData.delivery,
            troco: checkoutData.payment === 'Dinheiro' ? Number(checkoutData.troco) : null
        };

        const { error } = await supabase.from('orders').insert([dbOrder]);

        if (!error) {
            const storePhone = storeConfig.whatsappNumber.replace(/\D/g, '');
            let message = `*${storeConfig.storeName.toUpperCase()} - NOVO PEDIDO*\n----------------------------\n`;
            message += `👤 *Cliente:* ${checkoutData.name}\n`;
            message += `📞 *WhatsApp:* ${checkoutData.phone}\n`;
            message += `🛵 *Tipo:* ${checkoutData.delivery}\n`;
            if (checkoutData.delivery === 'Entrega') {
                message += `📍 *Endereço:* ${checkoutData.address}\n`;
            }
            message += `💳 *Pagamento:* ${checkoutData.payment}\n`;
            if (checkoutData.payment === 'Dinheiro' && checkoutData.troco) {
                message += `💵 *Troco para:* R$ ${checkoutData.troco}\n`;
            }
            message += `----------------------------\n\n`;
            cart.forEach(item => message += `• ${item.quantity}x ${item.product.name}\n`);
            message += `\n*TOTAL: R$ ${cartTotal.toFixed(2)}*`;

            setCart([]);
            setIsCartOpen(false);
            setOrders([{
                id: dbOrder.id,
                customerName: dbOrder.customer_name,
                customerPhone: dbOrder.customer_phone,
                items: dbOrder.items,
                total: dbOrder.total,
                timestamp: dbOrder.timestamp,
                status: dbOrder.status as any,
                confirmationToken: dbOrder.confirmation_token
            }, ...orders]);
            window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
        }
        setDbSyncing(false);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans relative selection:bg-rose-500 selection:text-white">
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}></div>

            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-40 border-b border-rose-50 px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-600 rounded-xl text-white shadow-lg"><UtensilsCrossed size={20} /></div>
                    <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">{storeConfig.storeName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg"><Lock size={14} /> Admin</button>
                    <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100"><ShoppingBag size={22} />{cart.length > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}</button>
                </div>
            </nav>

            <header className="relative pt-48 pb-32 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[1] tracking-tighter mb-6 drop-shadow-2xl">A Mordida que <br /> <span className="text-rose-500">Você Merece.</span></h1>
                    <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-10 drop-shadow-md">Cada detalhe pensado para o seu paladar. Peça agora e receba em casa!</p>
                </div>
            </header>

            <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
                    <button onClick={() => handleCategorySelect('Todos')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeCategory === 'Todos' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Todos</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => handleCategorySelect(cat)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeCategory === cat ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{cat}</button>
                    ))}
                </div>
            </div>

            <main ref={menuSectionRef} className="max-w-7xl mx-auto px-4 py-12">
                {!storeConfig.isStoreOpen && <div className="mb-12 bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center font-bold text-rose-800 animate-pulse uppercase tracking-widest text-sm">Cozinha fechada no momento!</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col overflow-hidden">
                            <div className="w-full aspect-square bg-slate-50 rounded-[2rem] mb-6 overflow-hidden">
                                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Pizza size={100} /></div>}
                            </div>
                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{p.category}</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{p.name}</h3>
                                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{p.description}</p>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <span className="text-3xl font-black text-slate-900">R$ {p.sellPrice.toFixed(2)}</span>
                                <button onClick={() => addToCart(p)} disabled={!storeConfig.isStoreOpen} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-rose-600 shadow-xl transition-all disabled:opacity-20 active:scale-95"><Plus size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                        <div className="p-8 border-b flex items-center justify-between"><h2 className="font-black text-slate-900 text-xl tracking-tighter uppercase">MEU PEDIDO</h2><button onClick={() => setIsCartOpen(false)}><X size={24} /></button></div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {cart.map(item => (
                                <div key={item.product.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                                    <div><h4 className="font-black text-slate-900">{item.product.name}</h4><p className="text-rose-600 font-black text-sm">R$ {(item.product.sellPrice * item.quantity).toFixed(2)}</p></div>
                                    <div className="flex items-center gap-2"><span className="font-black">{item.quantity}x</span></div>
                                </div>
                            ))}
                            <div className="space-y-4 pt-6">
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                    <button
                                        onClick={() => setCheckoutData({ ...checkoutData, delivery: 'Entrega' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${checkoutData.delivery === 'Entrega' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Entrega
                                    </button>
                                    <button
                                        onClick={() => setCheckoutData({ ...checkoutData, delivery: 'Retirada' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${checkoutData.delivery === 'Retirada' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Retirada
                                    </button>
                                </div>

                                <input placeholder="Seu Nome" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} />
                                <input placeholder="WhatsApp (DDD + Número)" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} />

                                {checkoutData.delivery === 'Entrega' && (
                                    <input placeholder="Endereço Completo" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} />
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</p>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none font-bold"
                                        value={checkoutData.payment}
                                        onChange={e => setCheckoutData({ ...checkoutData, payment: e.target.value })}
                                    >
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão">Cartão (Entregador leva a maquininha)</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                    </select>
                                </div>

                                {checkoutData.payment === 'Dinheiro' && (
                                    <input placeholder="Troco para quanto?" type="number" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none border-2 border-rose-100" value={checkoutData.troco} onChange={e => setCheckoutData({ ...checkoutData, troco: e.target.value })} />
                                )}
                            </div>
                        </div>
                        <div className="p-8 border-t bg-slate-50">
                            <button onClick={sendWhatsAppOrder} disabled={dbSyncing || cart.length === 0} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"><Send size={18} /> Finalizar Pedido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
