import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../constants';
import { Product } from '../../types';

export const CreateProduct: React.FC = () => {
    const { products, saveProduct, dbSyncing } = useStore();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', category: 'Lanches', costPrice: 0, sellPrice: 0, stock: 0, sku: '', imageUrl: ''
    });
    const [aiGenerating, setAiGenerating] = useState(false);

    useEffect(() => {
        console.log("CreateProduct: checking id", id);
        if (id) {
            const product = products.find(p => p.id === id);
            console.log("CreateProduct: found product", product);
            if (product) setFormData(product);
        }
    }, [id, products]);

    const handleAiAssistant = async () => {
        alert("[VERSÃO 2.0] Iniciando Assistente de IA...");
        if (!formData.name) {
            alert("Erro: Digite o nome do produto primeiro.");
            return;
        }

        console.log("IA: Iniciando geração para", formData.name);
        setAiGenerating(true);
        try {
            // Vite replacement of process.env.API_KEY
            const apiKey = process.env.API_KEY;
            console.log("IA: Verificando chave (primeiros 4 chars):", apiKey?.substring(0, 4));

            if (!apiKey || apiKey === 'undefined' || apiKey === '') {
                alert("ERRO: Chave de API não encontrada!");
            }

            const ai = new GoogleGenAI({ apiKey: apiKey || '' });

            const response = await ai.models.generateContent({
                model: "gemini-pro",
                contents: `Faça uma descrição gourmet curta e apetitosa para o produto: "${formData.name}". Responda APENAS o JSON com os campos description, category e sku.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            sku: { type: Type.STRING }
                        },
                        required: ["description", "category", "sku"]
                    }
                }
            });

            console.log("IA: Resposta recebida", response);
            if (!response.text) throw new Error("A IA retornou uma resposta vazia.");

            const result = JSON.parse(response.text);
            setFormData(prev => ({ ...prev, ...result }));
            alert("Sucesso! Descrição gerada.");
        } catch (e: any) {
            console.error("IA: Erro detalhado", e);
            alert(`Erro na IA: ${e.message || "Erro desconhecido. Verifique o F12."}`);
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await saveProduct(formData, id || null);
        if (success) {
            navigate('/admin/products');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] border shadow-2xl space-y-10 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{id ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="space-y-6">
                <input
                    required
                    id="productName"
                    placeholder="Nome do Produto"
                    value={formData.name || ''}
                    onChange={e => {
                        console.log("CreateProduct: Name input changing to", e.target.value);
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                    }}
                    className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-bold text-slate-900"
                />
                <div className="p-6 bg-rose-600 rounded-3xl text-white space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase">IA Gourmet</span>
                        <button
                            type="button"
                            onClick={handleAiAssistant}
                            disabled={aiGenerating || !formData.name}
                            className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {aiGenerating ? 'Gerando...' : 'Gerar com IA'}
                        </button>
                    </div>
                    {!formData.name && <p className="text-[10px] text-rose-200 uppercase tracking-widest bg-black/10 p-2 rounded-lg text-center">⚠ Digite o nome do produto para ativar</p>}
                    <textarea
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full bg-white/10 rounded-2xl p-5 outline-none placeholder:text-rose-200"
                        placeholder="Descrição gerada pela IA..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="Preço de Venda"
                        value={formData.sellPrice || ''}
                        onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                        className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-black"
                    />
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-5 bg-slate-50 rounded-2xl font-black uppercase text-xs"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={dbSyncing}
                    className="flex-1 py-6 bg-rose-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl"
                >
                    {dbSyncing ? 'Sincronizando...' : 'Salvar no Banco'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="px-8 py-6 bg-slate-100 text-slate-400 rounded-[2rem] font-black uppercase text-xs"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};
