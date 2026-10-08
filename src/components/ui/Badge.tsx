import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-50 text-primary border border-primary-100',
    secondary: 'bg-stone-100 text-stone-700 border border-stone-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    outline: 'bg-transparent text-stone-700 border border-stone-300',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full font-bold gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full font-bold gap-1.5',
  };

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-stone-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    outline: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {icon}
      {children}
    </span>
  );
};
