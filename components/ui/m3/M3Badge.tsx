'use client';

import React from 'react';

export interface M3BadgeProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface';
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const M3Badge: React.FC<M3BadgeProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  dot = false,
}) => {
  let colorClasses = '';

  switch (variant) {
    case 'error':
      colorClasses = 'bg-m3-error-container text-m3-on-error-container border border-m3-error/20';
      break;
    case 'secondary':
      colorClasses = 'bg-m3-secondary-container text-m3-on-secondary-container border border-m3-secondary/20';
      break;
    case 'tertiary':
      colorClasses = 'bg-m3-tertiary-container text-m3-on-tertiary-container border border-m3-tertiary/20';
      break;
    case 'surface':
      colorClasses = 'bg-m3-surface-container text-m3-on-surface-variant border border-m3-outline-variant/40';
      break;
    case 'primary':
    default:
      colorClasses = 'bg-m3-primary-container text-m3-on-primary-container border border-m3-primary/20';
      break;
  }

  if (dot) {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          variant === 'error' ? 'bg-m3-error' : 'bg-m3-primary'
        } ${className}`}
      />
    );
  }

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default M3Badge;
