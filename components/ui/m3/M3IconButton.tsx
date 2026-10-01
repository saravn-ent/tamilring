'use client';

import React from 'react';
import Link from 'next/link';

export interface M3IconButtonProps {
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
  selected?: boolean;
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  'aria-label': string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const M3IconButton: React.FC<M3IconButtonProps> = ({
  variant = 'standard',
  selected = false,
  children,
  className = '',
  href,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
  title,
  type = 'button',
  ...props
}) => {
  let variantClasses = '';

  switch (variant) {
    case 'filled':
      variantClasses = selected
        ? 'bg-m3-primary text-m3-on-primary'
        : 'bg-m3-surface-container-highest text-m3-primary hover:bg-m3-primary hover:text-m3-on-primary';
      break;
    case 'tonal':
      variantClasses = selected
        ? 'bg-m3-secondary-container text-m3-on-secondary-container'
        : 'bg-m3-surface-container-high text-m3-on-surface-variant hover:bg-m3-secondary-container hover:text-m3-on-secondary-container';
      break;
    case 'outlined':
      variantClasses = selected
        ? 'bg-m3-inverse-surface text-m3-inverse-on-surface border border-transparent'
        : 'border border-m3-outline text-m3-on-surface-variant hover:bg-m3-on-surface/8 hover:text-m3-on-surface';
      break;
    case 'standard':
    default:
      variantClasses = selected
        ? 'text-m3-primary bg-m3-primary/12'
        : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8';
      break;
  }

  const baseClasses = `inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-90 touch-manipulation select-none ${variantClasses} ${
    disabled ? 'opacity-38 pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={baseClasses}
        aria-label={ariaLabel}
        title={title || ariaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

export default M3IconButton;
