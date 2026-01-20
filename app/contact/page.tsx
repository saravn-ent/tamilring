import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
            <h1 className="text-3xl font-black mb-8 text-brand-dark tracking-tight">Contact Us</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-zinc-600 text-lg leading-relaxed">
                        Have questions, suggestions, or just want to say hello? We'd love to hear from you.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-brand-wash p-3 rounded-2xl border border-brand-border">
                                <Mail className="text-brand-accent" size={24} />
                            </div>
                            <div>
                                <h3 className="text-brand-dark font-bold">Email Us</h3>
                                <a href="mailto:tamilring.in@gmail.com" className="text-zinc-500 hover:text-brand-accent transition-colors font-medium">
                                    tamilring.in@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-xl shadow-brand-dark/5">
                    <h2 className="text-xl font-bold text-brand-dark mb-4">Send us a message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors placeholder:text-zinc-400 text-sm font-medium"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors placeholder:text-zinc-400 text-sm font-medium"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors placeholder:text-zinc-400 text-sm font-medium resize-none"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-brand-dark hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98]"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
