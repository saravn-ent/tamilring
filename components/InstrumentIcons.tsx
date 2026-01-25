
import React from 'react';
import { LucideProps } from 'lucide-react';


export const VeenaIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Main Body - Resonator */}
        <path d="M12 21c-4.97 0-9-3.5-9-7.5S7 6 12 6s9 3.5 9 7.5-4.03 7.5-9 7.5z" />
        {/* Neck */}
        <path d="M12 2v4" />
        <path d="M11 2h2" />
        {/* Fretboard details */}
        <path d="M12 6v9" />
        <path d="M10 8h4" />
        <path d="M10 12h4" />
        <path d="M10 16h4" />
        {/* Additional Resonator / Detail */}
        <circle cx="12" cy="18" r="1.5" />
    </svg>
);

export const TrumpetIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Mouthpiece */}
        <path d="M4 10h3v4H4z" />
        {/* Tube connecting to flare */}
        <path d="M7 11h6c1 0 2-1 4-2v6c-2-1-3-2-4-2H7v-2z" />
        {/* Flare */}
        <path d="M17 9l4-3v12l-4-3" />
        {/* Valves */}
        <path d="M10 8v8" />
        <path d="M13 8v8" />
        <path d="M10 6v2" />
        <path d="M13 6v2" />
    </svg>
);

export const WhistleIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Whistle Outline: Circle Body + Mouthpiece */}
        <path d="M11 7 L22 7 L22 12 L16.8 12 A 7 7 0 1 1 11 7" />
        {/* Lanyard Ring */}
        <path d="M5.5 17a2.5 2.5 0 1 0-4.5 1.5" />
        {/* 3D/Depth Detail on Body */}
        <path d="M8 12a4 4 0 0 0 4 4" strokeOpacity="0.5" />
    </svg>
);

export const SaxophoneIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Main Body J-shape */}
        <path d="M6 3v13c0 3 2 5 5 5h1c3 0 5-2 5-5V10h-3v4c0 1-1 2-2 2h-1c-1 0-2-1-2-2V3h-3z" />
        {/* Mouthpiece */}
        <path d="M9 3h-2" />
        {/* Keys/Holes */}
        <circle cx="9" cy="8" r="1" />
        <circle cx="9" cy="11" r="1" />
        <circle cx="9" cy="14" r="1" />
        {/* Bell */}
        <path d="M17 10l2-2" />
        <path d="M17 10l2 2" />
    </svg>
);

export const FluteIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M2 20L20 2" />
        <path d="M18 4l2-2" />
        <path d="M4 18l-2 2" />
        {/* Holes */}
        <circle cx="8" cy="14" r="1" />
        <circle cx="11" cy="11" r="1" />
        <circle cx="14" cy="8" r="1" />
    </svg>
);

export const ViolinIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Hourglass Body Shape */}

        <path d="M11.5 2a.5.5 0 0 0-.5.5v1a1.5 1.5 0 0 1-1.5 1.5H8a2 2 0 0 0-2 2c0 1.5 1 2.5 2 3 .5.25.5.75 0 1-1 .5-2 1.5-2 3a2 2 0 0 0 2 2h1.5a1.5 1.5 0 0 1 1.5 1.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a1.5 1.5 0 0 1 1.5-1.5H16a2 2 0 0 0 2-2c0-1.5-1-2.5-2-3-.5-.25-.5-.75 0-1 1-.5 2-1.5 2-3a2 2 0 0 0-2-2h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1a.5.5 0 0 0-.5-.5h-1z" />

        {/* Strings/Bridge */}
        <path d="M12 2v17" />
        <path d="M10 14h4" />

        {/* F-holes (simplified as curves) */}
        <path d="M9 11c-.5 1-.5 2 0 3" />
        <path d="M15 11c.5 1 .5 2 0 3" />
    </svg>
);

export const NadaswaramIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Long Bell Shape */}
        <path d="M19 21l-4-16a1 1 0 0 0-2 0L9 21" />
        {/* Bell Flare */}
        <path d="M9 21h10" />
        {/* Holes */}
        <circle cx="14" cy="9" r="0.5" fill="currentColor" />
        <circle cx="13.5" cy="12" r="0.5" fill="currentColor" />
        <circle cx="13" cy="15" r="0.5" fill="currentColor" />
        {/* Mouthpiece */}
        <path d="M13 3l-1-2" />
    </svg>
);

export const DrumsIcon = ({ size = 24, className, ...props }: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Drum Body */}
        <path d="M7 13v6a4 2 0 0 0 10 0v-6" />
        {/* Top Rim */}
        <ellipse cx="12" cy="13" rx="5" ry="2" />
        <path d="M12 21v-6" />
        {/* Sticks */}
        <path d="M5 5l6 6" />
        <path d="M19 5l-6 6" />
        <circle cx="5" cy="5" r="1" />
        <circle cx="19" cy="5" r="1" />
    </svg>
);
