'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !data?.session?.user) {
            setError('بريد إلكتروني أو كلمة مرور غير صحيحة');
            setLoading(false);
            return;
        }

        const user = data.session.user;

        // ============ توجيه فوري وآمن ============
        // 1. إذا كان البريد هو المشرف، نرسله مباشرة
        if (user.email === 'admin@shaghil.com') {
            window.location.href = '/admin/dashboard';
            return;
        }

        // 2. لباقي الأدوار نعتمد على app_metadata
        const role = user.app_metadata?.role;

        if (role === 'COMPANY') {
            window.location.href = '/company/dashboard';
        } else if (role === 'ADMIN') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/applicant/dashboard';
        }
    };

    return (
        <main className="min-h-screen bg-glossy-black flex flex-col items-center justify-center px-4">
            <Logo size="md" />
            <div className="mt-8 w-full max-w-md bg-deep-charcoal p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white text-center mb-6">تسجيل الدخول</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email" placeholder="البريد الإلكتروني"
                        value={email} onChange={e => setEmail(e.target.value)} required
                        className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                    />
                    <input
                        type="password" placeholder="كلمة المرور"
                        value={password} onChange={e => setPassword(e.target.value)} required
                        className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                    />
                    {error && <p className="text-fiery-red text-sm">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'جارٍ الدخول...' : 'دخول'}
                    </Button>
                </form>
                <p className="text-ash-grey text-sm mt-4 text-center">
                    ليس لديك حساب؟ <a href="/register" className="text-fiery-red">أنشئ حساباً</a>
                </p>
            </div>
        </main>
    );
}