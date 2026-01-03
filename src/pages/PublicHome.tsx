import React, { useState, useMemo, useRef } from 'react';
import {
    ShoppingBag, Plus, X, Pizza, Search, MapPin, Phone, MessageCircle, Truck,
    ArrowRight, ChevronRight, Star, Clock, UtensilsCrossed, Lock, Send, RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../constants';
import { Product, CartItem } from '../types';
import { supabase } from '../services/supabase';
import { getPlaceholderImage } from '../utils/imageUtils';

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
        name: '', phone: '', address: '', payment: 'Pix', delivery: 'Entrega' as 'Entrega' | 'Retirada', troco: ''
    });

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, activeCategory]);

    const addToCart = (product: Product) => {
        if (!storeConfig.isStoreOpen) return;
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);

    const sendWhatsAppOrder = async () => {
        if (!checkoutData.name || (checkoutData.delivery === 'Entrega' && !checkoutData.address) || !checkoutData.phone) {
            alert("Preencha todos os campos para continuarmos!");
            return;
        }

        setDbSyncing(true);
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
            customer_address: checkoutData.delivery === 'Entrega' ? checkoutData.address : null,
            troco: checkoutData.payment === 'Dinheiro' ? Number(checkoutData.troco) : null
        };

        const { error } = await supabase.from('orders').insert([dbOrder]);

        if (!error) {
            const storePhone = storeConfig.whatsappNumber.replace(/\D/g, '');
            let message = `*${storeConfig.storeName.toUpperCase()} - NOVO PEDIDO*\n----------------------------\n`;
            message += `👤 *Cliente:* ${checkoutData.name}\n`;
            message += `📞 *WhatsApp:* ${checkoutData.phone}\n`;
            message += `🛵 *Tipo:* ${checkoutData.delivery}\n`;
            if (checkoutData.delivery === 'Entrega') message += `📍 *Endereço:* ${checkoutData.address}\n`;
            message += `💳 *Pagamento:* ${checkoutData.payment}\n`;
            if (checkoutData.payment === 'Dinheiro' && checkoutData.troco) message += `💵 *Troco para:* R$ ${checkoutData.troco}\n`;
            message += `----------------------------\n\n`;
            cart.forEach(item => message += `• ${item.quantity}x ${item.product.name}\n`);
            message += `\n*TOTAL: R$ ${cartTotal.toFixed(2)}*`;

            setCart([]);
            setIsCartOpen(false);
            setOrders([dbOrder as any, ...orders]);
            window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            console.error("Erro Supabase:", error);
            alert(`Erro ao enviar pedido: ${error.message} (Código: ${error.code})`);
        }
        setDbSyncing(false);
    };

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-20">
            {/* Premium Navigation */}
            <nav className="fixed top-0 w-full z-50 px-4 md:px-8 h-24 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-rose-50 px-6 py-3 rounded-3xl shadow-2xl pointer-events-auto">
                    <div className="p-2.5 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-200">
                        <UtensilsCrossed size={18} />
                    </div>
                    <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">{storeConfig.storeName}</span>
                </div>

                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-rose-50 p-2 rounded-3xl shadow-2xl pointer-events-auto">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2"
                    >
                        <Lock size={12} /> Area VIP
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                    >
                        <ShoppingBag size={20} />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-white animate-bounce">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-4">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1920"
                        className="w-full h-full object-cover scale-110 animate-float"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-white"></div>
                </div>

                <div className="relative z-10 text-center space-y-8 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <Star size={12} className="text-amber-400 fill-amber-400" /> Experiência Gourmet de Verdade
                    </div>
                    <h1 className="text-6xl md:text-[9rem] font-black text-white leading-[0.8] tracking-tighter drop-shadow-2xl">
                        Sabor que <br /> <span className="text-rose-500 underline decoration-8 decoration-rose-500/30 underline-offset-8">Encanta.</span>
                    </h1>
                    <p className="text-slate-100 text-lg md:text-2xl max-w-2xl mx-auto font-medium opacity-90">
                        Dos melhores ingredientes para a sua mesa. Peça agoera o Delivery oficial do Delicias da Gio.
                    </p>
                    <div className="pt-6">
                        <button
                            onClick={() => menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-rose-600 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-rose-500/40 hover:bg-rose-700 hover:-translate-y-1 transition-all flex items-center gap-4 mx-auto"
                        >
                            Ver Cardápio <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-rose-50 py-6">
                <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory('Todos')}
                        className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border ${activeCategory === 'Todos' ? 'glass-card bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                            }`}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border ${activeCategory === cat ? 'glass-card bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <main ref={menuSectionRef} className="max-w-7xl mx-auto px-4 py-20 space-y-16">
                {!storeConfig.isStoreOpen && (
                    <div className="bg-rose-50 border-2 border-rose-100 p-10 rounded-[3rem] text-center space-y-2 animate-pulse">
                        <Clock size={32} className="mx-auto text-rose-300" />
                        <p className="font-black text-rose-800 uppercase tracking-widest text-sm">Cozinha em Descanso</p>
                        <p className="text-rose-600 text-xs">Voltamos em breve com mais delícias!</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="gourmet-card group bg-white p-8 flex flex-col space-y-6">
                            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-50">
                                <img
                                    src={p.imageUrl || getPlaceholderImage(p.category, p.name)}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-rose-600 uppercase tracking-widest border border-rose-50 shadow-lg">
                                    {p.category}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{p.name}</h3>
                                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-medium">{p.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-rose-50">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Valor Unitário</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {p.sellPrice.toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => addToCart(p)}
                                    disabled={!storeConfig.isStoreOpen}
                                    className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center hover:bg-rose-600 shadow-2xl shadow-rose-200 transition-all disabled:opacity-20 active:scale-90"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col">
                        <div className="p-10 border-b border-rose-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">Meu Pedido</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confira suas escolhas</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <UtensilsCrossed size={48} strokeWidth={1} className="text-slate-300" />
                                    <p className="font-black uppercase text-xs tracking-widest text-slate-400">Sua sacola está vazia</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="bg-white p-6 rounded-3xl border border-rose-50 shadow-sm flex gap-6 items-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                                            <img
                                                src={item.product.imageUrl || getPlaceholderImage(item.product.category, item.product.name)}
                                                className="w-full h-full object-cover"
                                                alt={item.product.name}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 tracking-tight">{item.product.name}</h4>
                                            <p className="text-rose-600 font-black text-xs">R$ {item.product.sellPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                            <button onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))} className="w-8 h-8 flex items-center justify-center font-black text-lg text-slate-400">-</button>
                                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addToCart(item.product)} className="w-8 h-8 flex items-center justify-center font-black text-lg text-rose-600">+</button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {cart.length > 0 && (
                                <div className="space-y-6 pt-10 border-t border-rose-50">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Detalhes da Entrega</label>
                                        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[2rem]">
                                            <button onClick={() => setCheckoutData({ ...checkoutData, delivery: 'Entrega' })} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${checkoutData.delivery === 'Entrega' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Entrega</button>
                                            <button onClick={() => setCheckoutData({ ...checkoutData, delivery: 'Retirada' })} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${checkoutData.delivery === 'Retirada' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Retirada</button>
                                        </div>
                                        <input placeholder="Seu Nome Completo" className="input-gourmet" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} />
                                        <input placeholder="WhatsApp com DDD" className="input-gourmet" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} />
                                        {checkoutData.delivery === 'Entrega' && <input placeholder="Endereço de Entrega" className="input-gourmet" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} />}
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Pagamento</label>
                                        <select className="input-gourmet appearance-none cursor-pointer" value={checkoutData.payment} onChange={e => setCheckoutData({ ...checkoutData, payment: e.target.value })}>
                                            <option value="Pix">Pix no Recebimento</option>
                                            <option value="Cartão">Cartão (Levar Maquininha)</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                        </select>
                                        {checkoutData.payment === 'Dinheiro' && <input placeholder="Precisa de troco para quanto?" type="number" className="input-gourmet animate-in slide-in-from-top-2 border-2 border-rose-200" value={checkoutData.troco} onChange={e => setCheckoutData({ ...checkoutData, troco: e.target.value })} />}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 border-t border-rose-50 bg-white space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Geral</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {cartTotal.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
                                        <Truck size={12} /> {checkoutData.delivery === 'Entrega' ? 'Entrega Grátis' : 'Retirada Local'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={sendWhatsAppOrder}
                                disabled={dbSyncing || cart.length === 0}
                                className="w-full py-6 bg-rose-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-200 hover:bg-rose-700 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-4 group"
                            >
                                {dbSyncing ? <RefreshCcw className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-1 transition-transform" />}
                                Finalizar Pedido no WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
