'use client';

import React from 'react';

export interface M3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const M3Card: React.FC<M3CardProps> = ({
  variant = 'outlined',
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  let variantClasses = '';

  switch (variant) {
    case 'elevated':
      variantClasses =
        'bg-m3-surface-container-low border border-m3-outline-variant/30 m3-elevation-1';
      if (interactive) {
        variantClasses += ' hover:m3-elevation-2 hover:bg-m3-surface-container cursor-pointer active:scale-[0.99]';
      }
      break;
    case 'filled':
      variantClasses = 'bg-m3-surface-container border border-transparent';
      if (interactive) {
        variantClasses += ' hover:bg-m3-surface-container-high cursor-pointer active:scale-[0.99]';
      }
      break;
    case 'outlined':
    default:
      variantClasses =
        'bg-m3-surface border border-m3-outline-variant/50';
      if (interactive) {
        variantClasses +=
          ' hover:border-m3-primary/60 hover:bg-m3-surface-container-low cursor-pointer active:scale-[0.99] m3-elevation-0 hover:m3-elevation-1';
      }
      break;
  }

  return (
    <div
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default M3Card;
