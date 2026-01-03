import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../constants';
import { Product } from '../../types';
import {
    Pizza, ArrowLeft, Sparkles, Save, RefreshCcw
} from 'lucide-react';

export const CreateProduct: React.FC = () => {
    const { products, saveProduct, dbSyncing } = useStore();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', category: 'Lanches', costPrice: 0, sellPrice: 0, stock: 0, sku: '', imageUrl: ''
    });
    const [aiGenerating, setAiGenerating] = useState(false);

    useEffect(() => {
        if (id) {
            const product = products.find(p => p.id === id);
            if (product) setFormData(product);
        }
    }, [id, products]);

    const handleAiAssistant = async () => {
        if (!formData.name) return;
        setAiGenerating(true);
        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });

            // Standardizing on gemini-1.5-flash for maximum compatibility
            const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `Você é um redator gourmet para a lanchonete 'Delícias da Gio'. 
            Crie uma descrição curta(máx 150 caracteres) e apetitosa para o produto: "${formData.name}".
            Retorne APENAS a descrição, sem aspas ou comentários adicionais.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                setFormData(prev => ({ ...prev, description: text }));
            }
        } catch (e: any) {
            console.error("Link AI Error:", e);
            // Silent fail or toast in a real app, here we will log to console
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await saveProduct(formData, id || null);
        if (success) navigate('/admin/products');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-slate-400 hover:text-rose-600 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                    <ArrowLeft size={16} /> Voltar para o Cardápio
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Banco de Dados Ativo</span>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="gourmet-card bg-white p-12 md:p-16 space-y-12">
                <div className="space-y-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Cadastro</span>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        {id ? 'Refinar Produto' : 'Novo Alimento'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: General Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Produto</label>
                            <input
                                required
                                value={formData.name || ''}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input-gourmet"
                                placeholder="Ex: Burger Gourmet Master"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Gourmet</label>
                                <button
                                    type="button"
                                    onClick={handleAiAssistant}
                                    disabled={aiGenerating || !formData.name}
                                    className="flex items-center gap-2 text-rose-600 hover:text-rose-700 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all"
                                >
                                    {aiGenerating ? <RefreshCcw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                    {aiGenerating ? 'A IA está cozinhando...' : 'Gerar com IA'}
                                </button>
                            </div>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="input-gourmet resize-none"
                                placeholder="Uma descrição que abra o apetite..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Pricing & Meta */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Preço Sugerido</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm">R$</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.sellPrice || ''}
                                        onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                                        className="input-gourmet pl-14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estoque</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.stock || ''}
                                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    className="input-gourmet"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoria Gourmet</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="input-gourmet appearance-none cursor-pointer"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Link da Imagem</label>
                            <div className="flex gap-4">
                                <input
                                    value={formData.imageUrl || ''}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="input-gourmet"
                                    placeholder="https://imagem.com/foto.jpg"
                                />
                                {formData.imageUrl && (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-100 flex-shrink-0">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 pt-10 border-t border-rose-50">
                    <button
                        type="submit"
                        disabled={dbSyncing}
                        className="btn-primary flex-1 flex items-center justify-center gap-4 py-6"
                    >
                        <Save size={20} />
                        <span className="text-sm">{dbSyncing ? 'Sincronizando...' : 'Consolidar Produto'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="btn-secondary px-10"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};
