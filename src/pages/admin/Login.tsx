import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, X } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const Login: React.FC = () => {
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const navigate = useNavigate();

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
            alert("Erro ao entrar: " + error.message);
        } else {
            navigate('/admin');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                        <KeyRound size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Área Restrita</h3>
                        <p className="text-slate-400 text-sm">Senha administrativa para acesso.</p>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <input
                            autoFocus
                            type="email"
                            placeholder="Email"
                            value={adminEmail}
                            onChange={e => { setAdminEmail(e.target.value); setLoginError(false); }}
                            className={`w-full px-6 py-5 bg-slate-50 rounded-2xl text-center text-lg tracking-wide border-2 transition-all ${loginError ? 'border-rose-500' : 'border-transparent focus:border-rose-100'
                                }`}
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={adminPassword}
                            onChange={e => { setAdminPassword(e.target.value); setLoginError(false); }}
                            className={`w-full px-6 py-5 bg-slate-50 rounded-2xl text-center text-2xl tracking-widest border-2 transition-all ${loginError ? 'border-rose-500' : 'border-transparent focus:border-rose-100'
                                }`}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-rose-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Entrando...' : 'Entrar no Sistema'}
                        </button>
                    </form>
                </div>
                <button onClick={() => navigate('/')} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
