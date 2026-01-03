import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Product, Order, StoreConfig, CartItem, OrderStatus } from '../types';

interface StoreContextType {
    products: Product[];
    orders: Order[];
    storeConfig: StoreConfig;
    loading: boolean;
    dbSyncing: boolean;
    fetchData: () => Promise<void>;
    updateStoreStatus: (isOpen: boolean) => Promise<void>;
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    saveProduct: (formData: Partial<Product>, editingId: string | null) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<void>;
    setDbSyncing: (val: boolean) => void;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbSyncing, setDbSyncing] = useState(false);
    const [storeConfig, setStoreConfig] = useState<StoreConfig>({
        whatsappNumber: '5591985760235',
        storeName: 'Delícias da Gio',
        isStoreOpen: true
    });

    const fetchData = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data: configData } = await supabase.from('store_config').select('*').single();
            if (configData) {
                setStoreConfig({
                    storeName: configData.store_name,
                    whatsappNumber: configData.whatsapp_number,
                    isStoreOpen: configData.is_store_open
                });
            }

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

            const { data: orderData } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
            if (orderData) {
                setOrders(orderData.map(o => ({
                    id: o.id,
                    customerName: o.customer_name,
                    customerPhone: o.customer_phone,
                    items: o.items,
                    total: o.total,
                    timestamp: Number(o.timestamp),
                    status: o.status,
                    confirmationToken: o.confirmation_token,
                    paymentMethod: o.payment_method,
                    deliveryMethod: o.delivery_method,
                    customerAddress: o.customer_address,
                    troco: o.troco
                })));
            }
        } catch (e) {
            console.error("Erro ao carregar do Supabase:", e);
        } finally {
            setLoading(false);
        }
    };

    const updateStoreStatus = async (isOpen: boolean) => {
        if (!supabase) return;
        setDbSyncing(true);
        await supabase.from('store_config').update({ is_store_open: isOpen }).eq('id', 1);
        setStoreConfig(prev => ({ ...prev, isStoreOpen: isOpen }));
        setDbSyncing(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        if (!supabase) return;
        setDbSyncing(true);
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            // WhatsApp notification logic will be moved to the component/hook that handles the update
        }
        setDbSyncing(false);
    };

    const saveProduct = async (formData: Partial<Product>, editingId: string | null) => {
        if (!supabase) return false;
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

        try {
            if (editingId) {
                await supabase.from('products').update(payload).eq('id', editingId);
            } else {
                await supabase.from('products').insert([payload]);
            }
            await fetchData();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            setDbSyncing(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!supabase) return;
        setDbSyncing(true);
        await supabase.from('products').delete().eq('id', id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setDbSyncing(false);
    };

    useEffect(() => {
        fetchData();

        // Realtime subscription
        if (!supabase) return;

        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder: Order = {
                            id: payload.new.id,
                            customerName: payload.new.customer_name,
                            customerPhone: payload.new.customer_phone,
                            items: payload.new.items,
                            total: payload.new.total,
                            timestamp: Number(payload.new.timestamp),
                            status: payload.new.status,
                            confirmationToken: payload.new.confirmation_token,
                            paymentMethod: payload.new.payment_method,
                            deliveryMethod: payload.new.delivery_method,
                            customerAddress: payload.new.customer_address,
                            troco: payload.new.troco
                        };
                        setOrders(prev => [newOrder, ...prev]);
                        // Simple browser notification if supported/granted
                        if (Notification.permission === 'granted') {
                            new Notification(`Novo Pedido de ${newOrder.customerName}!`, {
                                body: `Total: R$ ${newOrder.total.toFixed(2)}`,
                                icon: '/favicon.ico'
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(o => o.id === payload.new.id ? {
                            ...o,
                            status: payload.new.status,
                            confirmationToken: payload.new.confirmation_token,
                            paymentMethod: payload.new.payment_method,
                            deliveryMethod: payload.new.delivery_method,
                            customerAddress: payload.new.customer_address,
                            troco: payload.new.troco
                        } : o));
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <StoreContext.Provider value={{
            products, orders, storeConfig, loading, dbSyncing,
            fetchData, updateStoreStatus, updateOrderStatus, saveProduct, deleteProduct, setDbSyncing,
            setProducts, setOrders
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
