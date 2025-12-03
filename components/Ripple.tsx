'use client';

import React, { useState, useLayoutEffect } from 'react';

interface RippleProps {
  color?: string;
  duration?: number;
}

const Ripple: React.FC<RippleProps> = ({ color = 'rgba(255, 255, 255, 0.3)', duration = 600 }) => {
  const [rippleArray, setRippleArray] = useState<{ x: number; y: number; size: number; key: number }[]>([]);

  useLayoutEffect(() => {
    let bounce: number | null = null;
    const addRipple = (event: MouseEvent) => {
      if (bounce) clearTimeout(bounce);

      bounce = window.setTimeout(() => {
        bounce = null;
      }, duration * 2);

      const rippleContainer = event.currentTarget as HTMLElement;
      const size = rippleContainer.offsetWidth > rippleContainer.offsetHeight 
        ? rippleContainer.offsetWidth 
        : rippleContainer.offsetHeight;
      
      const x = event.pageX - rippleContainer.getBoundingClientRect().left - size / 2;
      const y = event.pageY - rippleContainer.getBoundingClientRect().top - size / 2;
      const newRipple = { x, y, size, key: Date.now() };

      setRippleArray(prev => [...prev, newRipple]);
    };

    const container = document.querySelectorAll('.ripple-container');
    
    const handleMouseDown = (e: Event) => {
        addRipple(e as MouseEvent);
    }

    container.forEach(el => {
        el.addEventListener('mousedown', handleMouseDown);
    });

    return () => {
        container.forEach(el => {
            el.removeEventListener('mousedown', handleMouseDown);
        });
    };
  }, [duration]);

  return (
    <>
      {rippleArray.length > 0 &&
        rippleArray.map((ripple, index) => {
          return (
            <span
              key={"ripple_" + index}
              className="ripple-effect"
              style={{
                top: ripple.y + ripple.size / 2,
                left: ripple.x + ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: color,
                animationDuration: `${duration}ms`
              }}
              onAnimationEnd={() => {
                  setRippleArray(prev => prev.filter(i => i.key !== ripple.key));
              }}
            />
          );
        })}
    </>
  );
};

// Helper hook or wrapper might be better, but for now let's just make a component that attaches to parent
// Actually, a better way for React is a wrapper component.

export const RippleWrapper = ({ children, className = "", onClick, ...props }: any) => {
    const [ripples, setRipples] = useState<{x: number, y: number, size: number, id: number}[]>([]);

    const addRipple = (event: React.MouseEvent) => {
        const container = event.currentTarget;
        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const newRipple = { x, y, size, id: Date.now() };
        setRipples(prev => [...prev, newRipple]);
        
        if (onClick) onClick(event);
    };

    return (
        <div 
            className={`ripple-container relative overflow-hidden ${className}`} 
            onMouseDown={addRipple}
            {...props}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/20 pointer-events-none animate-ripple"
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size,
                        transform: 'scale(0)',
                        animation: 'ripple-animation 0.6s linear'
                    }}
                    onAnimationEnd={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))}
                />
            ))}
        </div>
    );
};

export default RippleWrapper;
