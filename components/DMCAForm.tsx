'use client';

import { useState } from 'react';
import { Mail, Shield, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DMCAForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        workDescription: '',
        infringingUrls: '',
    });

    const [legalChecks, setLegalChecks] = useState({
        goodFaith: false,
        accurate: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLegalChecks(prev => ({ ...prev, [name]: checked }));
    };

    const handleDraftEmail = () => {
        const subject = `DMCA Takedown Request - ${formData.name}`;
        const body = `
DMCA TAKEDOWN NOTICE

To: TamilRing Copyright Agent
From: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

I am the copyright owner (or authorized to act on behalf of the owner) of the following copyrighted work:
${formData.workDescription}

I claim that the following material on TamilRing is infringing my copyright:
${formData.infringingUrls}

STATEMENTS AND DECLARATIONS:

[x] I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

[x] The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

Signed: ${formData.name}
        `.trim();

        const mailtoLink = `mailto:tamilring.in@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const isFormValid = formData.name && formData.email && formData.workDescription && formData.infringingUrls && legalChecks.goodFaith && legalChecks.accurate;

    return (
        <div className="space-y-8">
            {/* Traffic / Promotion Notice */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ExternalLink size={120} className="text-emerald-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-500">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Before you file a takedown...</h2>
                    </div>

                    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                        <p>
                            <span className="font-semibold text-white">We support artists!</span> We understand your rights, but we also want you to know that TamilRing acts as a <span className="text-emerald-400 font-bold">promotional platform</span> for your music.
                        </p>
                        <p>
                            Every ringtone page on our site includes direct, prominent links to stream the full song on <span className="text-white font-medium">Apple Music</span> and <span className="text-white font-medium">Spotify</span>.
                        </p>
                        <div className="bg-black/20 rounded-lg p-4 border border-white/5 my-2">
                            <p className="font-medium text-emerald-400 mb-1">💡 Pro Tip:</p>
                            <p>
                                Many copyright owners find that TamilRing is a significant source of <strong>free referral traffic</strong> to their official streaming profiles. Please check your analytics—we might be helping you earn more streams!
                            </p>
                        </div>
                        <p className="text-xs opacity-70">
                            However, if you still wish to proceed, please use the form below to submit a formal request.
                        </p>
                    </div>
                </div>
            </div>

            {/* DMCA Form */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Submit Takedown Request</h2>
                    <p className="text-zinc-400 text-sm">Fill out the details below to generate a formal DMCA notice.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Copyright Owner or Agent Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Where can we contact you?"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Contact number"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Identify Copyrighted Work</label>
                    <textarea
                        name="workDescription"
                        value={formData.workDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Describe the copyrighted work (e.g., 'Song Name by Artist Name' or link to original work)."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Infringing Material URL(s)</label>
                    <textarea
                        name="infringingUrls"
                        value={formData.infringingUrls}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-xs"
                        placeholder="https://tamilring.in/ringtone/..."
                    />
                    <p className="text-xs text-zinc-500">Please provide direct links to the content you want removed.</p>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="goodFaith"
                                checked={legalChecks.goodFaith}
                                onChange={handleCheckbox}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-neutral-600 rounded bg-neutral-800 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                            <CheckCircle2 size={12} className="absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="accurate"
                                checked={legalChecks.accurate}
                                onChange={handleCheckbox}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-neutral-600 rounded bg-neutral-800 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                            <CheckCircle2 size={12} className="absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                        </span>
                    </label>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleDraftEmail}
                        disabled={!isFormValid}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFormValid
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        <Mail size={20} />
                        <span>Draft Email Report</span>
                        {isFormValid && <ArrowRight size={18} />}
                    </button>
                    <p className="text-center text-xs text-zinc-600 mt-3">
                        This button will open your default email client with a pre-filled message.
                    </p>
                </div>
            </div>
        </div>
    );
}
