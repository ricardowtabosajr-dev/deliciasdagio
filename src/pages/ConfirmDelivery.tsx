import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useStore } from '../context/StoreContext';

export const ConfirmDelivery: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const { storeConfig } = useStore();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        const confirmOrder = async () => {
            if (!token || !supabase) {
                setStatus('error');
                setErrorMsg('Token de confirmação inválido ou ausente.');
                return;
            }

            try {
                // First find the order by token
                const { data, error: findError } = await supabase
                    .from('orders')
                    .select('id, status')
                    .eq('confirmation_token', token)
                    .single();

                if (findError) {
                    console.warn("Busca por token falhou, tentando fallback por ID...", findError);

                    // Fallback for old links (Phase 1 used order ID)
                    const { data: oldData, error: oldError } = await supabase
                        .from('orders')
                        .select('id, status')
                        .eq('id', token)
                        .single();

                    if (oldError || !oldData) {
                        console.error("Pedido não encontrado em nenhum formato:", oldError);
                        setStatus('error');
                        setErrorMsg('O link de confirmação parece ter expirado ou o pedido não existe.');
                        return;
                    }

                    // Update by ID (legacy)
                    const { error: updateError } = await supabase
                        .from('orders')
                        .update({ status: 'Entregue' })
                        .eq('id', oldData.id);

                    if (updateError) throw updateError;
                } else if (data) {
                    // Update by token (secure)
                    const { error: updateError } = await supabase
                        .from('orders')
                        .update({ status: 'Entregue' })
                        .eq('confirmation_token', token);

                    if (updateError) throw updateError;
                }

                setStatus('success');
            } catch (err: any) {
                console.error("Erro fatal na confirmação:", err);
                setStatus('error');
                setErrorMsg('Falha de conexão. Por favor, tente novamente em instantes.');
            }
        };

        confirmOrder();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-12 text-center shadow-2xl space-y-6 animate-in zoom-in-95">
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                            <Loader2 size={48} className="animate-spin" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Confirmando...</h2>
                        <p className="text-slate-500">Aguarde um momento enquanto atualizamos seu pedido.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Pedido Entregue!</h2>
                        <p className="text-slate-500">Obrigado por avisar! Esperamos que sua experiência com a {storeConfig.storeName} tenha sido incrível. 😋</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-rose-600 transition-all"
                        >
                            Ir para o Início
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ops! Algo falhou</h2>
                        <p className="text-rose-500/80 font-medium">{errorMsg}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-6 bg-slate-100 text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                            Voltar ao Início
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
