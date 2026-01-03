import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
    const [isAdminAuth, setIsAdminAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAdminAuth(!!session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
    };

    return { isAdminAuth, loading, signOut };
};
