'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeFix() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const currentTheme = resolvedTheme || theme;

        // Force background and foreground colors on the body and html
        // This is a failsafe for when Tailwind/CSS variables are being overridden by unknown sources
        if (currentTheme === 'light') {
            document.documentElement.style.backgroundColor = '#ffffff';
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#0a0a0a';
        } else {
            document.documentElement.style.backgroundColor = '#050505';
            document.body.style.backgroundColor = '#050505';
            document.body.style.color = '#fafafa';
        }

        console.log('ThemeFix: Applied', currentTheme);
    }, [theme, resolvedTheme, mounted]);

    return null;
}
