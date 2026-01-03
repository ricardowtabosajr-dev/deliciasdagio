import React from 'react';
import { Plus, Edit3, Trash2, Pizza } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { getPlaceholderImage } from '../../utils/imageUtils';

export const Products: React.FC = () => {
    const { products, deleteProduct, dbSyncing } = useStore();
    const navigate = useNavigate();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Gestão</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Meu Cardápio</h1>
                </div>
                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="btn-primary flex items-center gap-3"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Novo Produto</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="gourmet-card group bg-white hover:scale-[1.02] transition-all duration-500">
                        <div className="h-64 bg-slate-100 relative overflow-hidden">
                            <img
                                src={product.imageUrl || getPlaceholderImage(product.category)}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/50">
                                    {product.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-rose-600 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium line-clamp-2">{product.description}</p>
                            </div>

                            <div className="flex justify-between items-end pt-4 border-t border-rose-50/50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço de Venda</p>
                                    <p className="text-2xl font-black text-rose-600 tracking-tighter">R$ {product.sellPrice.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque</p>
                                    <span className={`text-xs font-black uppercase ${product.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {product.stock} un
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 size={12} /> Editar
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Deseja excluir este produto?')) deleteProduct(product.id);
                                    }}
                                    disabled={dbSyncing}
                                    className="px-6 py-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
