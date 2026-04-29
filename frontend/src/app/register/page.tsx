'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'APPLICANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. إنشاء حساب في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || 'فشل التسجيل');
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. إدخال بيانات المستخدم في جدول users
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email: form.email,
      role: form.role,
      first_name: form.firstName,
      last_name: form.lastName,
    });

    if (userError) {
      setError('فشل حفظ بيانات المستخدم');
      setLoading(false);
      return;
    }

    // 3. إنشاء السجل المرتبط (متقدم أو شركة)
    if (form.role === 'APPLICANT') {
      await supabase.from('applicant_profiles').insert({ user_id: userId });
    } else {
      await supabase.from('companies').insert({ user_id: userId, company_name: '' });
    }

    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-glossy-black flex flex-col items-center justify-center px-4">
      <Logo size="md" />
      <div className="mt-8 w-full max-w-md bg-deep-charcoal p-8 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-white text-center mb-6">إنشاء حساب</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="firstName" placeholder="الاسم الأول" onChange={handleChange} required className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red" />
          <input name="lastName" placeholder="الاسم الأخير" onChange={handleChange} required className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red" />
          <input name="email" type="email" placeholder="البريد الإلكتروني" onChange={handleChange} required className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red" />
          <input name="password" type="password" placeholder="كلمة المرور" onChange={handleChange} required className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red" />
          <select name="role" value={form.role} onChange={handleChange} className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red">
            <option value="APPLICANT">باحث عن مهمة</option>
            <option value="COMPANY">شركة</option>
          </select>
          {error && <p className="text-fiery-red text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'جارٍ التسجيل...' : 'سجّل الآن'}
          </Button>
        </form>
        <p className="text-ash-grey text-sm mt-4 text-center">
          لديك حساب؟ <a href="/login" className="text-fiery-red">تسجيل الدخول</a>
        </p>
      </div>
    </main>
  );
}