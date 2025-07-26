
import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', children: React.ReactNode }> = ({ children, variant = 'secondary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] flex items-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]';
  const variants = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-light)] focus:ring-[var(--color-focus)]',
    secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text-light)] focus:ring-[var(--color-focus-secondary)]',
    danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-[var(--color-text-light)] focus:ring-[var(--color-focus-danger)]',
  };
  return <button className={`${baseClasses} ${variants[variant]}`} {...props}>{children}</button>;
};

export default Button;