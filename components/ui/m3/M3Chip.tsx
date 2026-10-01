'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export interface M3ChipProps {
  variant?: 'filter' | 'assist' | 'suggestion';
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  variant = 'filter',
  selected = false,
  leadingIcon,
  label,
  children,
  className = '',
  href,
  onClick,
  disabled,
  ...props
}) => {
  const content = (
    <>
      {selected && variant === 'filter' && (
        <Check size={14} className="text-m3-on-secondary-container stroke-[2.5] shrink-0" />
      )}
      {!selected && leadingIcon && (
        <span className="shrink-0">{leadingIcon}</span>
      )}
      <span>{children || label}</span>
    </>
  );

  const baseClasses = `inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 touch-manipulation select-none ${
    selected
      ? 'bg-m3-secondary-container text-m3-on-secondary-container border border-transparent shadow-2xs font-bold'
      : 'bg-m3-surface-container-low hover:bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/60 hover:border-m3-outline'
  } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${className}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClasses} {...props}>
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
      {...props}
    >
      {content}
    </button>
  );
};

export default M3Chip;

