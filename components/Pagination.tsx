'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            {currentPage > 1 ? (
                <Link
                    href={createUrl(currentPage - 1)}
                    className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:border-brand-accent hover:text-brand-accent transition-all"
                >
                    <ChevronLeft size={20} />
                </Link>
            ) : (
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-300 cursor-not-allowed">
                    <ChevronLeft size={20} />
                </div>
            )}

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                    <Link
                        key={page}
                        href={createUrl(page)}
                        className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-xl font-bold text-sm transition-all border ${currentPage === page
                            ? 'bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/20'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-brand-accent hover:text-brand-accent'
                            }`}
                    >
                        {page}
                    </Link>
                ))}
            </div>

            {currentPage < totalPages ? (
                <Link
                    href={createUrl(currentPage + 1)}
                    className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:border-brand-accent hover:text-brand-accent transition-all"
                >
                    <ChevronRight size={20} />
                </Link>
            ) : (
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-300 cursor-not-allowed">
                    <ChevronRight size={20} />
                </div>
            )}
        </div>
    );
}
