import React from 'react';
import clsx from 'clsx';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export default function Select({
  label,
  options,
  error,
  className,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          'w-full px-3 py-1.5 border rounded text-xs text-slate-900 bg-white focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211] cursor-pointer',
          error ? 'border-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
