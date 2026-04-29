'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function ApplicantProfilePage() {
    const params = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!params?.id) return;

            // 1. جلب بيانات المستخدم من جدول users أو user_metadata
            const { data: userData } = await supabase
                .from('users')
                .select('first_name, last_name, email')
                .eq('id', params.id)
                .single();

            if (userData) {
                setProfile(userData);
            } else {
                // محاولة جلب الاسم من auth عبر getSession (قد لا يعمل لغير الحالي)
                setProfile({ first_name: 'متقدم', last_name: '', email: '' });
            }

            // 2. جلب المهام المكتملة لهذا المتقدم
            const { data: apps } = await supabase
                .from('applications')
                .select('*, tasks(title, compensation, duration)')
                .eq('applicant_id', params.id)
                .eq('status', 'COMPLETED');

            if (apps) {
                setCompletedTasks(apps);
            }

            setLoading(false);
        };

        load();
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-glossy-black flex items-center justify-center">
                <p className="text-ash-grey">جاري تحميل الملف...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Link href="/company/dashboard"><Logo size="sm" /></Link>
                <Link href="/company/dashboard"><Button variant="ghost" className="text-sm">رجوع للوحة الشركة</Button></Link>
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                {/* رأس الملف */}
                <div className="bg-deep-charcoal rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl font-bold">
                        {profile?.first_name} {profile?.last_name}
                    </h1>
                    {profile?.email && <p className="text-ash-grey mt-1">{profile.email}</p>}
                    <div className="mt-4 text-sm text-ash-grey">
                        <span className="text-fiery-red font-bold">{completedTasks.length}</span> مهمة مكتملة في السجل
                    </div>
                </div>

                {/* سجل الإنجازات */}
                <h2 className="text-xl font-bold mb-4">المهام المنجزة سابقاً</h2>
                {completedTasks.length === 0 ? (
                    <p className="text-ash-grey">لا توجد مهام مكتملة حتى الآن.</p>
                ) : (
                    <div className="grid gap-4">
                        {completedTasks.map((app: any) => (
                            <div key={app.id} className="bg-deep-charcoal rounded-xl p-5 border border-white/5">
                                <h3 className="font-bold text-white">{app.tasks?.title}</h3>
                                <p className="text-sm text-ash-grey mt-1">
                                    {app.tasks?.compensation} | {app.tasks?.duration}
                                </p>
                                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400">
                                    مكتملة ✓
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}