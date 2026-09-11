'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Lock } from 'lucide-react';

const DEMO_EMAIL = 'admin@demo.com';
const DEMO_PASSWORD = 'admin123';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent): void => {
        e.preventDefault();
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid credentials. Try admin@demo.com / admin123');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className='min-h-screen bg-slate-100 flex items-center justify-center p-4'>
                <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm'>
                    <div className='flex flex-col items-center mb-6'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3'>
                            <Lock size={24} className='text-blue-600' />
                        </div>
                        <h1 className='text-xl font-bold text-slate-900'>Admin Login</h1>
                        <p className='text-sm text-slate-500 mt-1'>
                            Panchayat Report Card
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className='space-y-4'>
                        <div>
                            <label htmlFor='login-email' className='block text-sm font-medium text-slate-700 mb-1'>
                                Email
                            </label>
                            <input
                                id='login-email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='admin@demo.com'
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor='login-password' className='block text-sm font-medium text-slate-700 mb-1'>
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
                            className='w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                            Sign In
                        </button>
                    </form>

                    <p className='text-xs text-slate-400 text-center mt-4'>
                        Demo: admin@demo.com / admin123
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-slate-100 flex'>
            <AdminSidebar />
            <main className='flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto'>
                <div className='max-w-6xl mx-auto'>{children}</div>
            </main>
        </div>
    );
}
