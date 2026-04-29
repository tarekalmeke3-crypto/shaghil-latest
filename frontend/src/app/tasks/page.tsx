'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [remoteOnly, setRemoteOnly] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        let query = supabase
            .from('tasks')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (skillFilter) {
            query = query.ilike('required_skills', `%${skillFilter}%`);
        }
        if (remoteOnly) {
            query = query.eq('remote_available', true);
        }

        const { data } = await query.limit(20);
        setTasks(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTasks();
    };

    return (
        <main className="min-h-screen bg-glossy-black text-white">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Link href="/"><Logo size="sm" /></Link>
                <Link href="/login">
                    <Button variant="ghost" className="text-sm">دخول</Button>
                </Link>
            </nav>

            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold">المهام المتاحة</h1>

                <form onSubmit={handleSearch} className="mt-6 flex flex-col md:flex-row gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن مهمة..."
                        className="flex-1 bg-deep-charcoal border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                    />
                    <input
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        placeholder="مهارة (Excel مثلاً)"
                        className="md:w-48 bg-deep-charcoal border border-white/10 rounded-lg p-3 text-white outline-none focus:border-fiery-red"
                    />
                    <label className="flex items-center gap-2 text-sm text-ash-grey">
                        <input
                            type="checkbox"
                            checked={remoteOnly}
                            onChange={(e) => setRemoteOnly(e.target.checked)}
                            className="accent-fiery-red"
                        />
                        عن بعد فقط
                    </label>
                    <Button type="submit">بحث</Button>
                </form>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        <p className="text-ash-grey col-span-2">جاري التحميل...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-ash-grey col-span-2">لا توجد مهام متاحة حالياً.</p>
                    ) : (
                        tasks.map((task: any) => (
                            <Link
                                key={task.id}
                                href={`/tasks/${task.id}`}
                                className="bg-deep-charcoal rounded-xl p-5 border border-white/5 hover:border-fiery-red/30 transition block"
                            >
                                <h3 className="font-bold text-white">{task.title}</h3>
                                <p className="text-sm text-ash-grey mt-1 line-clamp-2">{task.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {JSON.parse(task.required_skills || '[]').map((skill: string) => (
                                        <span key={skill} className="px-2 py-0.5 text-xs bg-black rounded-full text-ash-grey">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-4 text-xs text-ash-grey">
                                    <span>🏢 شركة</span>
                                    <span>{task.remote_available ? '🌐 عن بعد' : '📍 حضوري'}</span>
                                </div>
                                <div className="mt-2 text-sm text-white font-bold">{task.compensation}</div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}