import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-zinc-100">Contact Us</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-zinc-300 text-lg">
                        Have questions, suggestions, or just want to say hello? We'd love to hear from you.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-neutral-800 p-3 rounded-lg">
                                <Mail className="text-emerald-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-zinc-100 font-medium">Email Us</h3>
                                <a href="mailto:tamilring.in@gmail.com" className="text-zinc-400 hover:text-emerald-500 transition-colors">
                                    tamilring.in@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Optional: Add more contact info if needed
            <div className="flex items-start gap-4">
              <div className="bg-neutral-800 p-3 rounded-lg">
                <MapPin className="text-emerald-500" size={24} />
              </div>
              <div>
                <h3 className="text-zinc-100 font-medium">Location</h3>
                <p className="text-zinc-400">Chennai, Tamil Nadu, India</p>
              </div>
            </div>
            */}
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-zinc-100 mb-4">Send us a message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>
                        <button
                            type="button" // Change to submit when functionality is added
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
