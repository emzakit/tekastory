
import React from 'react';

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: React.ReactNode }> = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-[var(--color-text-medium)] mb-1">{label}</label>
    <textarea
      {...props}
      className="w-full bg-[var(--color-background)] border border-[var(--color-border-muted)] rounded-md p-2 text-sm text-[var(--color-text)] focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] transition"
    />
  </div>
);

export default TextArea;
