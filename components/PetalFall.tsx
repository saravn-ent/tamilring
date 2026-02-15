'use client';

import { useEffect, useState } from 'react';
import '../app/animations.css';

export default function PetalFall() {
    const [petals, setPetals] = useState<Array<{ left: string, delay: string, duration: string, fontSize: string, color: string, transform: string }>>([]);

    useEffect(() => {
        const newPetals = Array.from({ length: 15 }).map(() => ({
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 20}s`,
            duration: `${10 + Math.random() * 15}s`,
            fontSize: `${10 + Math.random() * 20}px`,
            color: `rgba(244, 63, 94, ${0.1 + Math.random() * 0.2})`,
            transform: `rotate(${Math.random() * 360}deg)`
        }));
        // eslint-disable-next-line
        setPetals(newPetals);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {petals.map((style, i) => (
                <div
                    key={i}
                    className="absolute animate-float opacity-0 rotate-12"
                    style={{
                        left: style.left,
                        top: `-10%`,
                        '--delay': style.delay,
                        '--duration': style.duration,
                        fontSize: style.fontSize,
                        color: style.color,
                        transform: style.transform
                        // eslint-disable-next-line
                    } as any}
                >
                    <div className="w-4 h-6 bg-rose-200/40 rounded-full blur-[1px] rotate-45" />
                </div>
            ))}
        </div>
    );
}
