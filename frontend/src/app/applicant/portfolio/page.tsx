'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function PortfolioPage() {
    const router = useRouter();
    const [completed, setCompleted] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPortfolio = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // بيانات المتقدم
            const { data: appProfile } = await supabase
                .from('applicant_profiles')
                .select('*, user:user_id(first_name, last_name, email)')
                .eq('user_id', user.id)
                .single();

            if (!appProfile) {
                router.push('/login');
                return;
            }
            setProfile(appProfile);

            // المهام المكتملة
            const { data: completedApps } = await supabase
                .from('applications')
                .select('*, task:tasks(title, description, required_skills, compensation, companies(company_name))')
                .eq('applicant_id', appProfile.id)
                .eq('status', 'COMPLETED')
                .order('updated_at', { ascending: false });

            setCompleted(completedApps || []);
            setLoading(false);
        };

        loadPortfolio();
    }, [router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-glossy-black flex items-center justify-center">
                <p className="text-ash-grey">جاري تحميل المحفظة...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Link href="/applicant/dashboard">
                    <Logo size="sm" />
                </Link>
                <div className="flex gap-3">
                    <Link href="/applicant/dashboard">
                        <Button variant="ghost" className="text-sm">لوحة التحكم</Button>
                    </Link>
                    <Link href="/tasks">
                        <Button variant="primary" className="text-sm">تصفح المهام</Button>
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                {/* رأس المحفظة */}
                <div className="bg-deep-charcoal rounded-2xl p-8 border border-white/5 mb-8">
                    <h1 className="text-3xl font-bold">
                        {profile?.user?.first_name} {profile?.user?.last_name}
                    </h1>
                    <p className="text-ash-grey mt-1">{profile?.user?.email}</p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-black rounded-lg p-4 text-center">
                            <div className="text-fiery-red text-2xl font-black">{completed.length}</div>
                            <div className="text-xs text-ash-grey mt-1">مهمة مكتملة</div>
                        </div>
                        <div className="bg-black rounded-lg p-4 text-center">
                            <div className="text-fiery-red text-2xl font-black">
                                {[...new Set(completed.flatMap((app: any) => JSON.parse(app.task?.required_skills || '[]')))].length}
                            </div>
                            <div className="text-xs text-ash-grey mt-1">مهارة مكتسبة</div>
                        </div>
                        <div className="bg-black rounded-lg p-4 text-center">
                            <div className="text-fiery-red text-2xl font-black">
                                {[...new Set(completed.map((app: any) => app.task?.companies?.company_name))].size}
                            </div>
                            <div className="text-xs text-ash-grey mt-1">شركة تعاملت معها</div>
                        </div>
                    </div>
                </div>

                {/* قائمة الإنجازات */}
                <h2 className="text-xl font-bold mb-4">سجل الإنجازات</h2>

                {completed.length === 0 ? (
                    <div className="bg-deep-charcoal rounded-2xl p-10 text-center border border-white/5">
                        <p className="text-ash-grey">لم تكمل أي مهمة بعد.</p>
                        <p className="text-ash-grey text-sm mt-2">ابدأ بتصفح المهام وقدّم عليها لبناء محفظتك.</p>
                        <Link href="/tasks">
                            <Button className="mt-4">تصفح المهام</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {completed.map((app: any) => (
                            <div key={app.id} className="bg-deep-charcoal rounded-xl p-5 border border-white/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white">{app.task?.title}</h3>
                                        <p className="text-sm text-ash-grey mt-1">{app.task?.companies?.company_name}</p>
                                    </div>
                                    <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                                        مكتملة ✓
                                    </span>
                                </div>
                                <p className="text-sm text-off-white mt-3 line-clamp-2">{app.task?.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {JSON.parse(app.task?.required_skills || '[]').map((skill: string) => (
                                        <span key={skill} className="px-2 py-0.5 text-xs bg-black rounded-full text-ash-grey">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-sm text-fiery-red font-bold mt-2">{app.task?.compensation}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}