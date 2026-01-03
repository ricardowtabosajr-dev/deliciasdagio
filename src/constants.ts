import { OrderStatus, StatusConfig } from './types';
import {
    Timer, Package, UtensilsCrossed, Truck, CheckCircle, X
} from 'lucide-react';

export const CATEGORIES = ["Lanches", "Bebidas", "Porções", "Combos", "Sobremesas"];

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
    'Pendente': { color: 'text-slate-400 bg-slate-100', icon: Timer },
    'Recebido': { color: 'text-blue-600 bg-blue-50', icon: Package },
    'Em preparo': { color: 'text-amber-600 bg-amber-50', icon: UtensilsCrossed },
    'Saiu para entrega': { color: 'text-rose-600 bg-rose-50', icon: Truck },
    'Entregue': { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
    'Cancelado': { color: 'text-rose-600 bg-rose-50', icon: X },
};
