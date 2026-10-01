'use client';

import React from 'react';

export interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'icon';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  let variantClasses = '';

  switch (variant) {
    case 'tonal':
      variantClasses =
        'bg-m3-secondary-container text-m3-on-secondary-container hover:opacity-90 active:scale-98 shadow-none';
      break;
    case 'outlined':
      variantClasses =
        'border border-m3-outline text-m3-primary hover:bg-m3-primary/5 active:scale-98 shadow-none';
      break;
    case 'text':
      variantClasses =
        'text-m3-primary hover:bg-m3-primary/5 active:scale-98 shadow-none px-3';
      break;
    case 'icon':
      return (
        <button
          type={type}
          disabled={disabled}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${className}`}
          {...props}
        >
          {children || leadingIcon}
        </button>
      );
    case 'filled':
    default:
      variantClasses =
        'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 active:scale-98 shadow-xs hover:shadow-sm';
      break;
  }

  const sizeClasses = size === 'small' 
    ? 'h-8 px-4 text-xs' 
    : size === 'large' 
      ? 'h-12 px-7 text-base' 
      : 'h-10 px-6 text-sm';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none touch-manipulation ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
      {children && <span>{children}</span>}
      {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
    </button>
  );
};

export default M3Button;
