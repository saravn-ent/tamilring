'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

interface ToolInfoProps {
    title: string;
    description: string;
    faqs: FAQ[];
    features?: string[];
}

export default function ToolInfo({ title, description, faqs, features }: ToolInfoProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="mt-8 max-w-4xl mx-auto px-2 pb-12">
            <div className="bg-m3-surface-container-low rounded-3xl border border-m3-outline-variant/40 shadow-xs overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-m3-primary-container text-m3-on-primary-container rounded-2xl flex items-center justify-center shrink-0">
                            <Info size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-m3-on-surface tracking-tight leading-tight">
                            About {title}
                        </h2>
                    </div>

                    <div className="mb-6">
                        {/* Visual Brief Description for Users */}
                        <p className="text-m3-on-surface-variant leading-relaxed text-sm md:text-base font-normal">
                            {description.split('.')[0]}. Professional tools for the perfect Tamil ringtone.
                        </p>

                        {/* Hidden SEO/AEO/GEO Content for Crawlers */}
                        <div className="sr-only">
                            <p>{description}</p>
                        </div>
                    </div>

                    {features && features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-3 bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30">
                                    <div className="w-2 h-2 bg-m3-primary rounded-full shrink-0" />
                                    <span className="text-m3-on-surface font-semibold text-xs">{feature}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 mb-4 pt-4 border-t border-m3-outline-variant/30">
                            <div className="w-8 h-8 bg-m3-tertiary-container text-m3-on-tertiary-container rounded-xl flex items-center justify-center shrink-0">
                                <HelpCircle size={16} />
                            </div>
                            <h3 className="text-base font-bold text-m3-on-surface">
                                FAQs
                            </h3>
                        </div>

                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-m3-outline-variant/30 rounded-2xl overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-m3-surface-container/40 hover:bg-m3-surface-container transition-colors cursor-pointer"
                                >
                                    <span className="text-sm font-semibold text-m3-on-surface pr-4">{faq.question}</span>
                                    {openIndex === idx ? (
                                        <ChevronUp size={16} className="text-m3-primary shrink-0" />
                                    ) : (
                                        <ChevronDown size={16} className="text-m3-outline shrink-0" />
                                    )}
                                </button>
                                {openIndex === idx && (
                                    <div className="p-4 bg-m3-surface-container-low text-xs text-m3-on-surface-variant border-t border-m3-outline-variant/20 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="mt-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Professional Audio Studio • {new Date().getFullYear()}
            </footer>
        </section>
    );
}
