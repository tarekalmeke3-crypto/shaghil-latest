'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function CompanyDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [compensation, setCompensation] = useState('');
    const [duration, setDuration] = useState('');
    const [remote, setRemote] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const { data: session } = await supabase.auth.getSession();
            const currentUser = session?.session?.user;
            if (!currentUser || currentUser.app_metadata?.role !== 'COMPANY') {
                router.push('/login');
                return;
            }
            setUser(currentUser);

            // جلب المهام مباشرة باستخدام user.id
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('*')
                .eq('company_id', currentUser.id)
                .order('created_at', { ascending: false });

            setTasks(tasksData || []);
            setLoading(false);
        };
        loadData();
    }, [router]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        const { error } = await supabase.from('tasks').insert({
            company_id: user.id,
            title,
            description,
            required_skills: JSON.stringify(skills.split(',').map(s => s.trim())),
            compensation,
            duration,
            remote_available: remote,
            status: 'ACTIVE',
        });
        if (error) {
            alert('فشل إنشاء المهمة: ' + error.message);
            setCreating(false);
            return;
        }
        const { data: fresh } = await supabase
            .from('tasks')
            .select('*')
            .eq('company_id', user.id)
            .order('created_at', { ascending: false });
        setTasks(fresh || []);
        setShowForm(false);
        setCreating(false);
        setTitle('');
        setDescription('');
        setSkills('');
        setCompensation('');
        setDuration('');
        setRemote(false);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-glossy-black flex items-center justify-center">
                <p className="text-ash-grey">جاري التحميل...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Logo size="sm" />
                <div className="flex items-center gap-3">
                    <span className="text-ash-grey text-sm">شركتي</span>
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push('/login');
                        }}
                        className="text-xs"
                    >
                        خروج
                    </Button>
                </div>
            </nav>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">لوحة الشركة</h1>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        variant={showForm ? 'secondary' : 'primary'}
                    >
                        {showForm ? 'إلغاء' : '+ مهمة جديدة'}
                    </Button>
                </div>
                {showForm && (
                    <form
                        onSubmit={handleCreateTask}
                        className="mt-6 bg-deep-charcoal p-6 rounded-2xl border border-white/5 space-y-4"
                    >
                        <h2 className="text-xl font-bold">نشر مهمة جديدة</h2>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="عنوان المهمة"
                            required
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                        />
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="وصف المهمة"
                            required
                            rows={3}
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                        />
                        <input
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            placeholder="المهارات المطلوبة (مفصولة بفواصل)"
                            required
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                value={compensation}
                                onChange={e => setCompensation(e.target.value)}
                                placeholder="التعويض (مثلاً 200 ريال)"
                                className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                            />
                            <input
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                placeholder="المدة (مثلاً 3 أيام)"
                                className="bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-ash-grey">
                            <input
                                type="checkbox"
                                checked={remote}
                                onChange={e => setRemote(e.target.checked)}
                                className="accent-fiery-red"
                            />
                            المهمة متاحة عن بعد
                        </label>
                        <Button type="submit" disabled={creating} className="w-full">
                            {creating ? 'جارٍ النشر...' : 'انشر المهمة'}
                        </Button>
                    </form>
                )}
                <h2 className="text-xl font-bold mt-10 mb-4">مهامك المنشورة</h2>
                {tasks.length === 0 ? (
                    <p className="text-ash-grey">لم تنشر أي مهمة بعد.</p>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task: any) => (
                            <div
                                key={task.id}
                                className="bg-deep-charcoal rounded-xl p-5 border border-white/5 flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="font-bold text-white">{task.title}</h3>
                                    <p className="text-sm text-ash-grey mt-1 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <span
                                        className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${task.status === 'ACTIVE'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-ash-grey/10 text-ash-grey'
                                            }`}
                                    >
                                        {task.status === 'ACTIVE' ? 'نشط' : task.status}
                                    </span>
                                </div>
                                {/* زر المتقدمين المضاف حديثاً */}
                                <div className="flex items-center gap-3">
                                    <Link href={`/company/tasks/${task.id}/applicants`}>
                                        <Button variant="ghost" className="text-xs">
                                            المتقدمين
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}