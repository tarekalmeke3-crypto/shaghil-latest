import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
    return (
        <main className="min-h-screen bg-glossy-black text-white overflow-hidden">
            {/* تأثيرات حمراء خلفية */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-fiery-red/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fiery-red/10 rounded-full blur-2xl pointer-events-none" />

            {/* المحتوى */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
                {/* كلمة واحدة فقط */}
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tight text-white">
                    شغّل
                </h1>

                {/* شعار فرعي */}
                <p className="mt-6 text-xl md:text-2xl text-ash-grey max-w-lg">
                    منصة المهام الأولى للشباب. لا أعذار، فقط إنجاز.
                </p>

                {/* أزرار الدعوة للحركة */}
                <div className="flex gap-4 mt-12 flex-wrap justify-center">
                    <Link href="/register">
                        <Button className="bg-fiery-red text-white px-10 py-5 text-lg font-bold shadow-2xl shadow-fiery-red/50 hover:scale-105 transition-transform animate-pulse">
                            سجّل الآن مجاناً
                        </Button>
                    </Link>
                    <Link href="/tasks">
                        <Button className="border border-fiery-red text-fiery-red px-10 py-5 text-lg font-bold hover:bg-fiery-red hover:text-white transition-colors">
                            تصفّح المهام
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button className="border border-white/20 text-white px-10 py-5 text-lg font-bold hover:bg-white hover:text-black transition-all">
                            تسجيل الدخول
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}