import { supabase } from './supabase';

export const signIn = async (
    email: string,
    password: string,
): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    return { error: null };
};

export const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
};

export const getSession = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
};

export const onAuthChange = (
    callback: (isLoggedIn: boolean) => void,
): (() => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(!!session);
    });
    return () => data.subscription.unsubscribe();
};
