import { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ variant = 'primary', children, className = '', ...props }: Props) {
  const base = 'px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 focus:outline-none inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-fiery-red text-white hover:bg-fiery-red/90 shadow-lg shadow-fiery-red/20',
    secondary: 'border border-fiery-red text-fiery-red hover:bg-fiery-red hover:text-white',
    ghost: 'text-white hover:bg-deep-charcoal',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}