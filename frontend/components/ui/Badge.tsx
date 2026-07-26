import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'gray' | 'orange' | 'green' | 'red';
}

export default function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border',
        variant === 'blue' && 'bg-blue-50 border-blue-200 text-blue-800',
        variant === 'gray' && 'bg-slate-50 border-slate-200 text-slate-700',
        variant === 'orange' && 'bg-orange-50 border-orange-200 text-orange-800',
        variant === 'green' && 'bg-green-50 border-green-200 text-green-800',
        variant === 'red' && 'bg-red-50 border-red-200 text-red-800'
      )}
    >
      {children}
    </span>
  );
}
