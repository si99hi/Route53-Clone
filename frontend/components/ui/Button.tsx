import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'secondary',
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center py-1.5 px-4 text-xs font-medium rounded transition-colors border select-none focus:outline-none focus:ring-1',
        variant === 'primary' &&
          'bg-[#ec7211] border-[#d65f00] text-slate-900 hover:bg-[#d65f00] focus:ring-[#ec7211]',
        variant === 'secondary' &&
          'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
        variant === 'danger' &&
          'bg-red-600 border-red-700 text-white hover:bg-red-700 focus:ring-red-500',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
