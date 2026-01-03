import { LucideIcon } from 'lucide-react';

export interface Product {
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

export interface CartItem {
    product: Product;
    quantity: number;
}

export type OrderStatus = 'Pendente' | 'Recebido' | 'Em preparo' | 'Saiu para entrega' | 'Entregue' | 'Cancelado';

export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    items: { name: string; qty: number; price: number }[];
    total: number;
    timestamp: number;
    status: OrderStatus;
    confirmationToken?: string; // Phase 2
    paymentMethod?: string; // Phase 4
    troco?: number; // Phase 4
    deliveryMethod?: 'Entrega' | 'Retirada'; // Phase 4
}

export interface StoreConfig {
    whatsappNumber: string;
    storeName: string;
    isStoreOpen: boolean;
}

export type AppMode = 'public' | 'admin';
export type AdminView = 'dashboard' | 'products' | 'create-product' | 'orders' | 'settings';

export interface StatusConfig {
    color: string;
    icon: LucideIcon;
}
