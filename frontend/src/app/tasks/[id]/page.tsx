'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const loadTask = async () => {
            if (!params?.id) {
                setLoading(false);
                return;
            }
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', params.id)
                .single();
            setTask(data);
            setLoading(false);
        };
        loadTask();
    }, [params.id]);

    const handleApply = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.app_metadata?.role !== 'APPLICANT') {
            alert('فقط المتقدمون يمكنهم التقديم على المهام.');
            return;
        }
        setApplying(true);
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('task_id', task.id)
            .eq('applicant_id', user.id)
            .maybeSingle();
        if (existing) {
            alert('لقد قدّمت على هذه المهمة بالفعل.');
            setApplying(false);
            return;
        }
        const { error } = await supabase.from('applications').insert({
            task_id: task.id,
            applicant_id: user.id,
        });
        if (error) {
            alert('فشل التقديم. حاول مجدداً.');
        } else {
            setSuccessMsg('تم التقديم بنجاح!');
        }
        setApplying(false);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-glossy-black flex items-center justify-center">
                <p className="text-ash-grey">جاري تحميل المهمة...</p>
            </main>
        );
    }

    if (!task) {
        return (
            <main className="min-h-screen bg-glossy-black flex flex-col items-center justify-center gap-4">
                <p className="text-ash-grey">المهمة غير موجودة</p>
                <Button variant="ghost" onClick={() => router.push('/tasks')}>
                    العودة للمهام
                </Button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Link href="/tasks"><Logo size="sm" /></Link>
                <Link href="/tasks">
                    <Button variant="ghost" className="text-sm">كل المهام</Button>
                </Link>
            </nav>
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-deep-charcoal rounded-2xl p-8 border border-white/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{task.title}</h1>
                            <p className="text-ash-grey mt-1">🏢 شركة</p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${task.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-ash-grey/10 text-ash-grey'}`}>
                            {task.status === 'ACTIVE' ? 'نشطة' : task.status}
                        </span>
                    </div>
                    <p className="mt-6 text-off-white leading-relaxed">{task.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-black rounded-lg p-4">
                            <div className="text-xs text-ash-grey">التعويض</div>
                            <div className="font-bold mt-1">{task.compensation}</div>
                        </div>
                        <div className="bg-black rounded-lg p-4">
                            <div className="text-xs text-ash-grey">المدة</div>
                            <div className="font-bold mt-1">{task.duration}</div>
                        </div>
                        <div className="bg-black rounded-lg p-4">
                            <div className="text-xs text-ash-grey">مكان العمل</div>
                            <div className="font-bold mt-1">{task.remote_available ? '🌐 عن بعد' : '📍 حضوري'}</div>
                        </div>
                        <div className="bg-black rounded-lg p-4">
                            <div className="text-xs text-ash-grey">نُشرت</div>
                            <div className="font-bold mt-1">{new Date(task.created_at).toLocaleDateString('ar-SA')}</div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm text-ash-grey mb-2">المهارات المطلوبة</h3>
                        <div className="flex flex-wrap gap-2">
                            {JSON.parse(task.required_skills || '[]').map((skill: string) => (
                                <span key={skill} className="px-3 py-1 text-sm bg-black rounded-full text-ash-grey border border-white/5">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-10">
                        {successMsg ? (
                            <p className="text-green-400 text-center text-lg font-bold">{successMsg}</p>
                        ) : (
                            <Button
                                onClick={handleApply}
                                disabled={applying}
                                className="w-full text-lg py-4"
                            >
                                {applying ? 'جارٍ التقديم...' : 'قدّم الآن على هذه المهمة'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}