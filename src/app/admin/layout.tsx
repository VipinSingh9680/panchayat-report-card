'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAppStore } from '@/lib/store';
import { signIn, signOut, getSession, onAuthChange } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { Lock, LogOut, Loader2 } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const loadFromSupabase = useAppStore((s) => s.loadFromSupabase);
    const dataLoaded = useAppStore((s) => s.dataLoaded);

    useEffect(() => {
        if (!dataLoaded) {
            loadFromSupabase();
        }
    }, [dataLoaded, loadFromSupabase]);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setIsAuthenticated(true);
            setChecking(false);
            return;
        }

        getSession().then((loggedIn) => {
            setIsAuthenticated(loggedIn);
            setChecking(false);
        });

        const unsubscribe = onAuthChange((loggedIn) => {
            setIsAuthenticated(loggedIn);
        });

        return unsubscribe;
    }, []);

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoggingIn(true);

        const { error: authError } = await signIn(email, password);

        if (authError) {
            setError(authError);
        }
        setLoggingIn(false);
    };

    const handleLogout = async (): Promise<void> => {
        await signOut();
        setIsAuthenticated(false);
    };

    if (checking) {
        return (
            <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
                <Loader2 size={32} className='animate-spin text-blue-600' />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className='min-h-screen bg-slate-100 flex items-center justify-center p-4'>
                <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm'>
                    <div className='flex flex-col items-center mb-6'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3'>
                            <Lock size={24} className='text-blue-600' />
                        </div>
                        <h1 className='text-xl font-bold text-slate-900'>
                            Admin Login
                        </h1>
                        <p className='text-sm text-slate-500 mt-1'>
                            Panchayat Report Card
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className='space-y-4'>
                        <div>
                            <label
                                htmlFor='login-email'
                                className='block text-sm font-medium text-slate-700 mb-1'>
                                Email
                            </label>
                            <input
                                id='login-email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='your@email.com'
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor='login-password'
                                className='block text-sm font-medium text-slate-700 mb-1'>
                                Password
                            </label>
                            <input
                                id='login-password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='••••••••'
                                required
                            />
                        </div>
                        {error && (
                            <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg'>
                                {error}
                            </p>
                        )}
                        <button
                            type='submit'
                            disabled={loggingIn}
                            className='w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                            {loggingIn ? (
                                <>
                                    <Loader2 size={16} className='animate-spin' />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-slate-100 flex'>
            <AdminSidebar />
            <main className='flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto'>
                <div className='max-w-6xl mx-auto'>
                    <div className='flex justify-end mb-4'>
                        <button
                            onClick={handleLogout}
                            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'>
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
