'use client';

import React from 'react';
import Link from 'next/link';

export interface M3FABProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  'aria-label'?: string;
  title?: string;
}

export const M3FAB: React.FC<M3FABProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  label,
  className = '',
  href,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
  title,
  ...props
}) => {
  let colorClasses = '';

  switch (variant) {
    case 'secondary':
      colorClasses = 'bg-m3-secondary-container text-m3-on-secondary-container hover:shadow-lg';
      break;
    case 'tertiary':
      colorClasses = 'bg-m3-tertiary-container text-m3-on-tertiary-container hover:shadow-lg';
      break;
    case 'surface':
      colorClasses = 'bg-m3-surface-container-high text-m3-primary hover:shadow-lg';
      break;
    case 'primary':
    default:
      colorClasses = 'bg-m3-primary-container text-m3-on-primary-container hover:shadow-lg';
      break;
  }

  const isExtended = Boolean(label);

  let sizeClasses = '';
  if (isExtended) {
    sizeClasses = 'h-14 px-5 rounded-2xl gap-3 text-sm font-semibold';
  } else {
    switch (size) {
      case 'small':
        sizeClasses = 'w-10 h-10 rounded-xl';
        break;
      case 'large':
        sizeClasses = 'w-24 h-24 rounded-[28px]';
        break;
      case 'medium':
      default:
        sizeClasses = 'w-14 h-14 rounded-2xl';
        break;
    }
  }

  const baseClasses = `inline-flex items-center justify-center m3-elevation-3 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer select-none touch-manipulation ${colorClasses} ${sizeClasses} ${
    disabled ? 'opacity-38 pointer-events-none' : ''
  } ${className}`;

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      {label && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={baseClasses}
        aria-label={ariaLabel || label}
        title={title || ariaLabel || label}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      aria-label={ariaLabel || label}
      title={title || ariaLabel || label}
      {...props}
    >
      {content}
    </button>
  );
};

export default M3FAB;
