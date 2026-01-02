
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import {
  Plus, Minus, Trash2, LayoutDashboard, UtensilsCrossed, Pizza, Coffee,
  Bike, Clock, MapPin, X, Send, Lock, ShoppingBag, History, Settings,
  Search, TrendingUp, AlertCircle, Edit3, Wand2, CheckCircle2, Phone,
  Package, Truck, CheckCircle, Timer, LogOut, KeyRound, Eye, EyeOff,
  MessageCircle, RefreshCcw
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// --- Supabase Config ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Initialize supabase only if keys exist to prevent "supabaseUrl is required" error
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- Types ---
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  createdAt: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type OrderStatus = 'Pendente' | 'Recebido' | 'Em preparo' | 'Saiu para entrega' | 'Entregue' | 'Cancelado';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  timestamp: number;
  status: OrderStatus;
}

interface StoreConfig {
  whatsappNumber: string;
  storeName: string;
  isStoreOpen: boolean;
}

type AppMode = 'public' | 'admin';
type AdminView = 'dashboard' | 'products' | 'create-product' | 'orders' | 'settings';

const CATEGORIES = ["Lanches", "Bebidas", "Porções", "Combos", "Sobremesas"];

const STATUS_CONFIG: Record<OrderStatus, { color: string, icon: any }> = {
  'Pendente': { color: 'text-slate-400 bg-slate-100', icon: Timer },
  'Recebido': { color: 'text-blue-600 bg-blue-50', icon: Package },
  'Em preparo': { color: 'text-amber-600 bg-amber-50', icon: UtensilsCrossed },
  'Saiu para entrega': { color: 'text-rose-600 bg-rose-50', icon: Truck },
  'Entregue': { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  'Cancelado': { color: 'text-rose-600 bg-rose-50', icon: X },
};

// --- Sub-Components ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-rose-600 text-white shadow-lg shadow-indigo-200'
      : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
      }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`font-medium ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
  </button>
);

const ProductCreationApp = () => {
  const [appMode, setAppMode] = useState<AppMode>('public');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [loading, setLoading] = useState(true);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    whatsappNumber: '5591985760235',
    storeName: 'Delícias da Gio',
    isStoreOpen: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '', payment: 'Cartão' });
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', description: '', category: 'Lanches', costPrice: 0, sellPrice: 0, stock: 0, sku: '', imageUrl: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const menuSectionRef = useRef<HTMLElement>(null);

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch Config
      const { data: configData } = await supabase.from('store_config').select('*').single();
      if (configData) {
        setStoreConfig({
          storeName: configData.store_name,
          whatsappNumber: configData.whatsapp_number,
          isStoreOpen: configData.is_store_open
        });
      }

      // Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData) {
        setProducts(prodData.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          costPrice: p.cost_price,
          sellPrice: p.sell_price,
          stock: p.stock,
          sku: p.sku,
          imageUrl: p.image_url,
          createdAt: new Date(p.created_at).getTime()
        })));
      }

      // Fetch Orders
      const { data: orderData } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
      if (orderData) {
        setOrders(orderData.map(o => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          items: o.items,
          total: o.total,
          timestamp: Number(o.timestamp),
          status: o.status
        })));
      }

    } catch (e) {
      console.error("Erro ao carregar do Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auth check from session
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuth(!!session);
      if (session) {
        setAppMode('admin');
        localStorage.setItem('gio_admin_auth', 'true'); // Keep local sync for initial load
      } else {
        setAppMode('public');
        localStorage.removeItem('gio_admin_auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const stats = useMemo(() => {
    const totalSales = orders.reduce((acc, o) => o.status !== 'Cancelado' ? acc + o.total : acc, 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    return { count: products.length, lowStock, totalSales };
  }, [products, orders]);

  const activeUserOrder = useMemo(() => {
    if (orders.length === 0) return null;
    const lastOrder = orders[0];
    const isRecent = Date.now() - lastOrder.timestamp < 24 * 60 * 60 * 1000;
    const isActive = !['Entregue', 'Cancelado'].includes(lastOrder.status);
    return (isRecent && isActive) ? lastOrder : null;
  }, [orders]);

  // --- Handlers ---
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    if (menuSectionRef.current) {
      const offset = 140;
      const elementPosition = menuSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const updateStoreStatus = async (isOpen: boolean) => {
    if (!supabase) return;
    setDbSyncing(true);
    await supabase.from('store_config').update({ is_store_open: isOpen }).eq('id', 1);
    setStoreConfig(prev => ({ ...prev, isStoreOpen: isOpen }));
    setDbSyncing(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      setLoginError(true);
      let errorMsg = error.message;
      if (errorMsg.includes("Email not confirmed")) errorMsg = "Email não confirmado. Ative o usuário no painel do Supabase.";
      if (errorMsg.includes("Invalid login credentials")) errorMsg = "Email ou senha incorretos.";
      alert("Erro ao entrar: " + errorMsg);
    } else {
      setIsLoginModalOpen(false);
      setLoginError(false);
    }
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    // Relaxed stock check: allow add if stock is 0 (or null) to prevent button disable during initial setup
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

    const dbOrder = {
      id: orderId,
      customer_name: checkoutData.name,
      customer_phone: checkoutData.phone.replace(/\D/g, ''),
      items: cart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.sellPrice })),
      total: cartTotal,
      timestamp: Date.now(),
      status: 'Pendente'
    };

    const { error } = await supabase.from('orders').insert([dbOrder]);

    if (!error) {
      // Reconstruct local order object for UI update (using camelCase)
      const localOrder: Order = {
        id: dbOrder.id,
        customerName: dbOrder.customer_name,
        customerPhone: dbOrder.customer_phone,
        items: dbOrder.items,
        total: dbOrder.total,
        timestamp: dbOrder.timestamp,
        status: dbOrder.status as OrderStatus
      };

      const storePhone = storeConfig.whatsappNumber.replace(/\D/g, '');
      let message = `*${storeConfig.storeName.toUpperCase()} - NOVO PEDIDO*\n----------------------------\n👤 *Cliente:* ${checkoutData.name}\n📍 *Endereço:* ${checkoutData.address}\n----------------------------\n\n`;
      cart.forEach(item => message += `• ${item.quantity}x ${item.product.name}\n`);
      message += `\n*TOTAL: R$ ${cartTotal.toFixed(2)}*`;

      setCart([]);
      setIsCartOpen(false);
      setOrders([localOrder, ...orders]);
      window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    setDbSyncing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!supabase) return;
    setDbSyncing(true);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (newStatus === 'Saiu para entrega') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const msg = `Olá ${order.customerName}! Seu pedido #${order.id} da ${storeConfig.storeName} saiu para entrega! 🛵💨`;
          window.open(`https://wa.me/${order.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        }
      }
    }
    setDbSyncing(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    if (!supabase) return;
    e.preventDefault();
    setDbSyncing(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cost_price: formData.costPrice,
      sell_price: formData.sellPrice,
      stock: formData.stock,
      sku: formData.sku,
      image_url: formData.imageUrl
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert([payload]);
    }

    await fetchData();
    setAdminView('products');
    setDbSyncing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const deleteProduct = async (id: string) => {
    if (!supabase) return;
    if (confirm('Remover item?')) {
      setDbSyncing(true);
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
      setDbSyncing(false);
    }
  };

  const handleAiAssistant = async () => {
    if (!formData.name) return;
    setAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Gere uma descrição gourmet curta e atrativa para: "${formData.name}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { description: { type: Type.STRING }, category: { type: Type.STRING }, sku: { type: Type.STRING } },
            required: ["description", "category", "sku"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({ ...prev, ...result }));
    } catch (e) { console.error(e); } finally { setAiGenerating(false); }
  };

  if (!supabaseUrl || !supabaseAnonKey) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6"><AlertCircle size={32} /></div>
      <h1 className="text-white text-2xl font-black mb-2 uppercase tracking-tighter">Erro de Configuração</h1>
      <p className="text-slate-400 max-w-sm mb-8">As chaves do Supabase não foram encontradas nas variáveis de ambiente. Verifique o arquivo .env ou as configurações do Vercel.</p>
      <div className="bg-slate-800 p-6 rounded-2xl text-left font-mono text-xs text-rose-300 w-full max-w-md">
        <p>SUPABASE_URL: {supabaseUrl ? 'OK' : 'MISSING'}</p>
        <p>SUPABASE_ANON_KEY: {supabaseAnonKey ? 'OK' : 'MISSING'}</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Carregando Delícias...</p>
    </div>
  );

  // --- RENDER PUBLIC ---
  if (appMode === 'public') {
    return (
      <div className="bg-slate-50 min-h-screen font-sans relative selection:bg-rose-500 selection:text-white">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}></div>

        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-40 border-b border-rose-50 px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600 rounded-xl text-white shadow-lg"><UtensilsCrossed size={20} /></div>
            <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">{storeConfig.storeName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => isAdminAuth ? setAppMode('admin') : setIsLoginModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg"><Lock size={14} /> Admin</button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100"><ShoppingBag size={22} />{cart.length > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}</button>
          </div>
        </nav>

        <header className="relative pt-48 pb-32 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover" />
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

        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto"><KeyRound size={32} /></div>
                <div><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Área Restrita</h3><p className="text-slate-400 text-sm">Senha administrativa para acesso.</p></div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <input autoFocus type="email" placeholder="Email" value={adminEmail} onChange={e => { setAdminEmail(e.target.value); setLoginError(false); }} className={`w-full px-6 py-5 bg-slate-50 rounded-2xl text-center text-lg tracking-wide border-2 transition-all ${loginError ? 'border-rose-500' : 'border-transparent focus:border-rose-100'}`} />
                  <input type="password" placeholder="Senha" value={adminPassword} onChange={e => { setAdminPassword(e.target.value); setLoginError(false); }} className={`w-full px-6 py-5 bg-slate-50 rounded-2xl text-center text-2xl tracking-widest border-2 transition-all ${loginError ? 'border-rose-500' : 'border-transparent focus:border-rose-100'}`} />
                  <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-rose-700 transition-all">Entrar no Sistema</button>
                </form>
              </div>
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={20} /></button>
            </div>
          </div>
        )}

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
                  <input placeholder="Seu Nome" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} />
                  <input placeholder="WhatsApp" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} />
                  <input placeholder="Endereço" className="w-full px-6 py-4 bg-slate-50 rounded-xl outline-none" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} />
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
  }

  // --- RENDER ADMIN ---
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-72 bg-white border-r p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white"><UtensilsCrossed size={20} /></div><span className="font-black text-slate-900 uppercase tracking-tighter">Painel Gio</span></div>
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={adminView === 'dashboard'} onClick={() => setAdminView('dashboard')} />
          <SidebarItem icon={Pizza} label="Cardápio" active={adminView === 'products'} onClick={() => setAdminView('products')} />
          <SidebarItem icon={History} label="Pedidos" active={adminView === 'orders'} onClick={() => setAdminView('orders')} />
        </nav>
        <div className="p-4 bg-slate-50 rounded-2xl border">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sincronização Cloud</p>
          <button onClick={() => updateStoreStatus(!storeConfig.isStoreOpen)} disabled={dbSyncing} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${storeConfig.isStoreOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{dbSyncing ? <RefreshCcw className="animate-spin" size={14} /> : (storeConfig.isStoreOpen ? 'Online' : 'Offline')}</button>
        </div>
        <button onClick={() => supabase?.auth.signOut()} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><LogOut size={14} /> Sair do Admin</button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto h-screen">
        {adminView === 'dashboard' && (
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
        )}

        {adminView === 'products' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-end">
              <div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gerenciar Cardápio</h2><p className="text-slate-400">Dados persistentes no Supabase</p></div>
              <button onClick={() => { setEditingId(null); setFormData({}); setAdminView('create-product'); }} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2"><Plus size={16} /> Novo Item</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Item</th><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Preço</th><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">Ações</th></tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-rose-50/20">
                      <td className="px-10 py-6 font-bold text-slate-900">{p.name} <span className="text-[9px] text-slate-300 font-black ml-2 uppercase tracking-widest">{p.category}</span></td>
                      <td className="px-10 py-6 font-black">R$ {p.sellPrice.toFixed(2)}</td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setFormData(p); setEditingId(p.id); setAdminView('create-product'); }} className="p-2 text-slate-400 hover:text-rose-600"><Edit3 size={18} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminView === 'orders' && (
          <div className="space-y-8 animate-in fade-in">
            <div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Fila de Pedidos</h2><p className="text-slate-400">Sincronizado em tempo real</p></div>
            <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Cliente</th><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Total</th><th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="px-10 py-6"><p className="font-black text-rose-400 text-xs">#{o.id}</p><p className="font-bold">{o.customerName}</p></td>
                      <td className="px-10 py-6 font-black">R$ {o.total.toFixed(2)}</td>
                      <td className="px-10 py-6">
                        <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none ${STATUS_CONFIG[o.status].color}`}>
                          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminView === 'create-product' && (
          <form onSubmit={handleSaveProduct} className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] border shadow-2xl space-y-10 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="space-y-6">
              <input required placeholder="Nome do Produto" value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-bold" />
              <div className="p-6 bg-rose-600 rounded-3xl text-white space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase">IA Gourmet</span>
                  <button type="button" onClick={handleAiAssistant} disabled={aiGenerating || !formData.name} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {aiGenerating ? 'Gerando...' : 'Gerar com IA'}
                  </button>
                </div>
                {!formData.name && <p className="text-[10px] text-indigo-200 uppercase tracking-widest bg-black/10 p-2 rounded-lg text-center">⚠ Digite o nome do produto para ativar</p>}
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-white/10 rounded-2xl p-5 outline-none placeholder:text-rose-200" placeholder="Descrição gerada pela IA..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <input required type="number" step="0.01" placeholder="Preço de Venda" value={formData.sellPrice || ''} onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-black" />
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-black uppercase text-xs">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" disabled={dbSyncing} className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">{dbSyncing ? 'Sincronizando...' : 'Salvar no Banco'}</button>
              <button type="button" onClick={() => setAdminView('products')} className="px-8 py-6 bg-slate-100 text-slate-400 rounded-[2rem] font-black uppercase text-xs">Cancelar</button>
            </div>
          </form>
        )}
      </main>

      {showSuccess && <div className="fixed bottom-12 right-12 bg-slate-900 text-white px-10 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-right flex items-center gap-3 font-black uppercase text-xs z-[100] border-t-4 border-emerald-500"><CheckCircle2 className="text-emerald-500" /> Sincronizado com Sucesso</div>}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<ProductCreationApp />);
