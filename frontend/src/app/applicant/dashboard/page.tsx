'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function ApplicantDashboard() {
    const [applications, setApplications] = useState<any[]>([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. جلب جلسة المستخدم
                const { data: sessionData } = await supabase.auth.getSession();
                const user = sessionData?.session?.user;
                if (!user) {
                    window.location.href = '/login';
                    return;
                }

                // 2. تعيين الاسم من بيانات المستخدم
                const meta = user.user_metadata;
                setUserName(`${meta?.first_name || 'مستخدم'} ${meta?.last_name || ''}`.trim());

                // 3. جلب جميع تقديمات المستخدم (بما فيها الجديدة)
                const { data: userApps, error: appsError } = await supabase
                    .from('applications')
                    .select('id, task_id, status, created_at')
                    .eq('applicant_id', user.id)
                    .order('created_at', { ascending: false });

                if (appsError) {
                    setError('فشل جلب تقديماتك');
                    setLoading(false);
                    return;
                }

                // 4. إذا وجدت تقديمات، نجلب تفاصيل المهام المرتبطة بها
                if (userApps && userApps.length > 0) {
                    const taskIds = userApps.map(app => app.task_id);
                    const { data: tasksData } = await supabase
                        .from('tasks')
                        .select('id, title, description, status, compensation, duration')
                        .in('id', taskIds);

                    // 5. دمج التقديمات مع تفاصيل المهام
                    const taskMap = new Map((tasksData || []).map(t => [t.id, t]));
                    const enriched = userApps.map(app => ({
                        ...app,
                        task: taskMap.get(app.task_id) || { title: 'مهمة محذوفة', status: 'UNKNOWN' }
                    }));
                    setApplications(enriched);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error(err);
                setError('حدث خطأ أثناء تحميل اللوحة');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    // دالة مساعدة لترجمة حالات التقديم
    const renderStatus = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'قيد المراجعة';
            case 'ACCEPTED': return 'مقبول';
            case 'REJECTED': return 'مرفوض';
            case 'COMPLETED': return 'مكتمل ✓';
            default: return status;
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-glossy-black flex items-center justify-center">
                <p className="text-ash-grey">جاري تحميل لوحتك...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Logo size="sm" />
                <div className="flex gap-3 items-center">
                    <Link href="/tasks">
                        <Button variant="ghost" className="text-sm">تصفح المهام</Button>
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="text-xs">خروج</Button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold">
                    {userName ? `أهلاً، ${userName}` : 'لوحة المتقدم'}
                </h1>
                <p className="text-ash-grey mt-1">تقديماتك على المهام</p>

                <div className="mt-8">
                    {error ? (
                        <div className="bg-deep-charcoal rounded-xl p-5 text-center">
                            <p className="text-fiery-red">{error}</p>
                            <Button variant="ghost" onClick={() => window.location.reload()} className="mt-2 text-xs">إعادة المحاولة</Button>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="bg-deep-charcoal rounded-xl p-8 text-center">
                            <p className="text-ash-grey">لم تتقدم على أي مهمة بعد.</p>
                            <Link href="/tasks">
                                <Button variant="primary" className="mt-4">تصفح المهام الآن</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="bg-deep-charcoal rounded-xl p-5 border border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">
                                            {app.task?.title || 'مهمة محذوفة'}
                                        </h3>
                                        <p className="text-xs text-ash-grey mt-1">
                                            {app.task?.compensation && `التعويض: ${app.task.compensation}`}
                                            {app.task?.duration && ` | المدة: ${app.task.duration}`}
                                        </p>
                                        <p className="text-sm text-ash-grey mt-1">الحالة: {renderStatus(app.status)}</p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {app.status === 'COMPLETED' && (
                                            <span className="text-green-400 text-sm font-bold">🎉 مكتملة</span>
                                        )}
                                        {app.task_id && (
                                            <Link href={`/tasks/${app.task_id}`}>
                                                <Button variant="ghost" className="text-xs">عرض التفاصيل</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}