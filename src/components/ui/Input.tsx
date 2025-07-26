
import React from 'react';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }> = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-[var(--color-text-medium)] mb-1">{label}</label>
    <input
      {...props}
      className="w-full bg-[var(--color-background)] border border-[var(--color-border-muted)] rounded-md p-2 text-sm text-[var(--color-text)] focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] transition disabled:bg-[var(--color-surface-muted)]"
    />
  </div>
);

export default Input;
