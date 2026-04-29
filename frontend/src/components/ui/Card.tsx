import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function Card({ children, className = '' }: Props) {
    return (
        <div className={`bg-deep-charcoal rounded-2xl p-6 border border-transparent hover:border-fiery-red/30 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}