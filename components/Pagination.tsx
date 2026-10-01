'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
    if (totalPages <= 1) return null;

    const createUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }
        const queryString = params.toString();
        return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <nav aria-label="Pagination Navigation" className="flex items-center justify-center gap-2 mt-8 mb-4">
            {currentPage > 1 ? (
                <Link
                    href={createUrl(currentPage - 1)}
                    onClick={() => hapticFeedback(hapticPatterns.selection)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-m3-surface-container-low border border-m3-outline-variant/60 text-m3-on-surface hover:bg-m3-surface-container hover:text-m3-primary transition-all active:scale-90"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={18} />
                </Link>
            ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-m3-surface-container-low/50 border border-m3-outline-variant/20 text-m3-outline/40 cursor-not-allowed">
                    <ChevronLeft size={18} />
                </div>
            )}

            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page) => (
                    <Link
                        key={page}
                        href={createUrl(page)}
                        onClick={() => hapticFeedback(hapticPatterns.selection)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all active:scale-90 ${
                            currentPage === page
                                ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                                : 'bg-m3-surface-container-low border border-m3-outline-variant/60 text-m3-on-surface hover:bg-m3-surface-container hover:text-m3-primary'
                        }`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </Link>
                ))}
            </div>

            {currentPage < totalPages ? (
                <Link
                    href={createUrl(currentPage + 1)}
                    onClick={() => hapticFeedback(hapticPatterns.selection)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-m3-surface-container-low border border-m3-outline-variant/60 text-m3-on-surface hover:bg-m3-surface-container hover:text-m3-primary transition-all active:scale-90"
                    aria-label="Next Page"
                >
                    <ChevronRight size={18} />
                </Link>
            ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-m3-surface-container-low/50 border border-m3-outline-variant/20 text-m3-outline/40 cursor-not-allowed">
                    <ChevronRight size={18} />
                </div>
            )}
        </nav>
    );
}

