import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full px-3 py-1.5 border rounded text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211]',
          error ? 'border-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
