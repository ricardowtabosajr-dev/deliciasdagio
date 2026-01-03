import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export const Products: React.FC = () => {
    const { products, deleteProduct } = useStore();
    const navigate = useNavigate();

    const handleDelete = async (id: string) => {
        if (confirm('Remover item?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gerenciar Cardápio</h2>
                    <p className="text-slate-400">Dados persistentes no Supabase</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2"
                >
                    <Plus size={16} /> Novo Item
                </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Item</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Preço</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-rose-50/20">
                                <td className="px-10 py-6 font-bold text-slate-900">
                                    {p.name}
                                    <span className="text-[9px] text-slate-300 font-black ml-2 uppercase tracking-widest">{p.category}</span>
                                </td>
                                <td className="px-10 py-6 font-black">R$ {p.sellPrice.toFixed(2)}</td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                                            className="p-2 text-slate-400 hover:text-rose-600"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
