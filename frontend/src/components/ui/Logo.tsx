export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl',
    };
    return (
        <div className={`font-bold ${sizeClasses[size]} tracking-tight`}>
            <span className="text-white">شغ</span>
            <span className="text-fiery-red">ّ</span>
            <span className="text-white">ل</span>
            <span className="text-fiery-red">.</span>
        </div>
    );
}