import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow',
    gradient:
      'bg-gradient-to-r from-primary via-primary-500 to-[#FF5E62] text-white shadow-md hover:shadow-lg',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800',
    outline: 'border border-stone-200 hover:bg-stone-50 text-stone-700',
    ghost: 'hover:bg-stone-100 text-stone-600',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[36px]',
    md: 'text-xs px-4 py-2.5 rounded-xl gap-2 min-h-[44px]',
    lg: 'text-sm px-5 py-3.5 rounded-2xl gap-2.5 min-h-[48px]',
    icon: 'w-10 h-10 rounded-full p-2',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
