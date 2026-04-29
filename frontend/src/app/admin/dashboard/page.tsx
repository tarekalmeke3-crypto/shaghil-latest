'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function AdminDashboard() {
    const [counts, setCounts] = useState({ users: 0, tasks: 0, applications: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        // إحصائيات سريعة
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: tasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
        const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
        setCounts({ users: usersCount || 0, tasks: tasksCount || 0, applications: appsCount || 0 });

        // قوائم كاملة
        const { data: allUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        const { data: allTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        setUsers(allUsers || []);
        setTasks(allTasks || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        await supabase.from('users').delete().eq('id', userId);
        fetchData();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
        await supabase.from('tasks').delete().eq('id', taskId);
        fetchData();
    };

    if (loading) return <main className="min-h-screen bg-glossy-black flex items-center justify-center"><p className="text-ash-grey">جاري التحميل...</p></main>;

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Logo size="sm" />
                <Button
                    variant="ghost"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="text-xs"
                >
                    خروج
                </Button>
            </nav>
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>

                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-deep-charcoal rounded-xl p-5">
                        <div className="text-2xl font-black text-fiery-red">{counts.users}</div>
                        <div className="text-sm text-ash-grey">مستخدمين</div>
                    </div>
                    <div className="bg-deep-charcoal rounded-xl p-5">
                        <div className="text-2xl font-black text-fiery-red">{counts.tasks}</div>
                        <div className="text-sm text-ash-grey">مهام</div>
                    </div>
                    <div className="bg-deep-charcoal rounded-xl p-5">
                        <div className="text-2xl font-black text-fiery-red">{counts.applications}</div>
                        <div className="text-sm text-ash-grey">تقديمات</div>
                    </div>
                </div>

                {/* جدول المستخدمين */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold mb-4">قائمة المستخدمين</h2>
                    <div className="bg-deep-charcoal rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-black/50 text-ash-grey text-xs">
                                <tr>
                                    <th className="p-3 text-right">الاسم</th>
                                    <th className="p-3 text-right">البريد الإلكتروني</th>
                                    <th className="p-3 text-right">الدور</th>
                                    <th className="p-3 text-right">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-ash-grey">لا يوجد مستخدمون بعد.</td>
                                    </tr>
                                ) : (
                                    users.map((u: any) => (
                                        <tr key={u.id} className="border-t border-white/5">
                                            <td className="p-3">{u.first_name} {u.last_name}</td>
                                            <td className="p-3 text-ash-grey">{u.email}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                                                        u.role === 'COMPANY' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-green-500/10 text-green-400'
                                                    }`}>
                                                    {u.role === 'ADMIN' ? 'مشرف' : u.role === 'COMPANY' ? 'شركة' : 'متقدم'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-fiery-red hover:underline text-xs"
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* جدول المهام */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold mb-4">قائمة المهام</h2>
                    <div className="bg-deep-charcoal rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-black/50 text-ash-grey text-xs">
                                <tr>
                                    <th className="p-3 text-right">العنوان</th>
                                    <th className="p-3 text-right">الحالة</th>
                                    <th className="p-3 text-right">تاريخ النشر</th>
                                    <th className="p-3 text-right">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-ash-grey">لا توجد مهام بعد.</td>
                                    </tr>
                                ) : (
                                    tasks.map((t: any) => (
                                        <tr key={t.id} className="border-t border-white/5">
                                            <td className="p-3">{t.title}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${t.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                                        t.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-ash-grey/10 text-ash-grey'
                                                    }`}>
                                                    {t.status === 'ACTIVE' ? 'نشطة' : t.status === 'COMPLETED' ? 'مكتملة' : t.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-ash-grey">{new Date(t.created_at).toLocaleDateString('ar-SA')}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleDeleteTask(t.id)}
                                                    className="text-fiery-red hover:underline text-xs"
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}