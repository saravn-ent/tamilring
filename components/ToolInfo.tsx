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
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-10">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            About {title}
                        </h2>
                    </div>

                    <div className="mb-8">
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            {description}
                        </p>
                    </div>

                    {features && features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                                    <span className="text-slate-700 font-bold text-xs">{feature}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 mb-4 pt-4 border-t border-slate-100">
                            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <HelpCircle size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                FAQs
                            </h3>
                        </div>

                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-slate-50 rounded-xl overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-sm font-bold text-slate-800 pr-4">{faq.question}</span>
                                    {openIndex === idx ? (
                                        <ChevronUp size={16} className="text-indigo-500 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openIndex === idx && (
                                    <div className="p-4 pt-0 bg-slate-50/50 text-slate-600 text-xs leading-relaxed animate-in slide-in-from-top-2 duration-300">
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
