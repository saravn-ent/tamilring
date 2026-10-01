'use client';

import React from 'react';

export interface M3TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface M3TabsProps {
  tabs: M3TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const M3Tabs: React.FC<M3TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'primary',
  className = '',
}) => {
  if (variant === 'secondary') {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-m3-surface-container rounded-full overflow-x-auto scrollbar-hide ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-m3-secondary-container text-m3-on-secondary-container font-bold shadow-2xs'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-m3-on-secondary-container/15 text-m3-on-secondary-container' : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full border-b border-m3-outline-variant/40 bg-m3-surface/80 backdrop-blur-md overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex w-full min-w-max justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 h-12 px-4 transition-all cursor-pointer group select-none ${
                isActive
                  ? 'text-m3-primary font-bold'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/5 font-medium'
              }`}
            >
              {tab.icon && (
                <span className={`shrink-0 transition-colors ${isActive ? 'text-m3-primary' : 'text-m3-on-surface-variant group-hover:text-m3-on-surface'}`}>
                  {tab.icon}
                </span>
              )}
              <span className="text-xs sm:text-sm tracking-wide">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                  isActive ? 'bg-m3-primary-container text-m3-on-primary-container' : 'bg-m3-surface-container-highest text-m3-outline'
                }`}>
                  {tab.badge}
                </span>
              )}

              {/* M3 Active Indicator (3dp height with rounded-t-full) */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-m3-primary rounded-t-full transition-all duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default M3Tabs;
