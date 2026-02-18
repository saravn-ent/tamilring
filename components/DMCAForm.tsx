'use client';

import { useState } from 'react';
import { Shield, ExternalLink, CircleCheckBig, ArrowRight, Loader2 } from 'lucide-react';
import { submitDmcaRequest } from '@/app/actions/dmca';

export default function DMCAForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMessage('');
        try {
            const res = await submitDmcaRequest({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                workDescription: formData.workDescription,
                infringingUrls: formData.infringingUrls,
                goodFaith: legalChecks.goodFaith,
                accurate: legalChecks.accurate
            });

            if (res.success) {
                setIsSuccess(true);
            } else {
                setErrorMessage(res.error || 'Failed to submit request.');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name && formData.email && formData.workDescription && formData.infringingUrls && legalChecks.goodFaith && legalChecks.accurate;

    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CircleCheckBig size={40} />
                </div>
                <h2 className="text-3xl font-black text-green-800">Request Received</h2>
                <p className="text-green-700 font-medium max-w-lg mx-auto">
                    We have received your DMCA takedown notice. Our legal team will review it and take appropriate action within 24-48 hours. A confirmation email has been sent to {formData.email}.
                </p>
                <div className="pt-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-sm font-bold text-green-700 hover:text-green-900 underline"
                    >
                        Submit another request
                    </button>
                </div>
            </div>
        );
    }

    return (

        <div className="space-y-8">
            {/* Traffic / Promotion Notice */}
            <div className="bg-brand-dark border border-brand-border/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ExternalLink size={120} className="text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/10 p-2.5 rounded-xl text-brand-accent backdrop-blur-sm border border-white/10">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Before you file a takedown...</h2>
                    </div>

                    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed font-medium">
                        <p>
                            <span className="font-bold text-white">We support artists!</span> We understand your rights, but we also want you to know that TamilRing acts as a <span className="text-brand-accent font-black">promotional platform</span> for your music.
                        </p>
                        <p>
                            Every ringtone page on our site includes direct, prominent links to stream the full song on <span className="text-white font-bold">Apple Music</span> and <span className="text-white font-bold">Spotify</span>.
                        </p>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 my-2 backdrop-blur-sm">
                            <p className="font-black text-brand-accent mb-1 uppercase tracking-wider text-xs">💡 Pro Tip:</p>
                            <p className="text-zinc-200">
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
            <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-brand-dark mb-1 tracking-tight">Submit Takedown Request</h2>
                    <p className="text-zinc-500 text-sm font-medium">Fill out the details below to generate a formal DMCA notice.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-zinc-400 font-medium disabled:opacity-50"
                            placeholder="Copyright Owner or Agent Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-zinc-400 font-medium disabled:opacity-50"
                            placeholder="Where can we contact you?"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-zinc-400 font-medium disabled:opacity-50"
                        placeholder="Contact number"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider ml-1">Identify Copyrighted Work</label>
                    <textarea
                        name="workDescription"
                        value={formData.workDescription}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={3}
                        className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-zinc-400 font-medium resize-none disabled:opacity-50"
                        placeholder="Describe the copyrighted work (e.g., 'Song Name by Artist Name' or link to original work)."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wider ml-1">Infringing Material URL(s)</label>
                    <textarea
                        name="infringingUrls"
                        value={formData.infringingUrls}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={4}
                        className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all font-mono text-xs placeholder:text-zinc-400 disabled:opacity-50"
                        placeholder="https://tamilring.in/ringtone/..."
                    />
                    <p className="text-xs text-zinc-500 ml-1 font-medium">Please provide direct links to the content you want removed.</p>
                </div>

                <div className="pt-6 border-t border-brand-border space-y-4">
                    {errorMessage && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {errorMessage}
                        </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer group bg-brand-wash/50 p-4 rounded-xl border border-transparent hover:border-brand-border transition-colors">
                        <div className="relative flex items-center pt-0.5">
                            <input
                                type="checkbox"
                                name="goodFaith"
                                checked={legalChecks.goodFaith}
                                onChange={handleCheckbox}
                                disabled={isSubmitting}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-zinc-300 rounded-md bg-white peer-checked:bg-brand-accent peer-checked:border-brand-accent transition-colors"></div>
                            <CircleCheckBig size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-zinc-600 font-medium group-hover:text-brand-dark transition-colors leading-snug">
                            I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group bg-brand-wash/50 p-4 rounded-xl border border-transparent hover:border-brand-border transition-colors">
                        <div className="relative flex items-center pt-0.5">
                            <input
                                type="checkbox"
                                name="accurate"
                                checked={legalChecks.accurate}
                                onChange={handleCheckbox}
                                disabled={isSubmitting}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-zinc-300 rounded-md bg-white peer-checked:bg-brand-accent peer-checked:border-brand-accent transition-colors"></div>
                            <CircleCheckBig size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-sm text-zinc-600 font-medium group-hover:text-brand-dark transition-colors leading-snug">
                            The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${isFormValid && !isSubmitting
                            ? 'bg-brand-dark text-white hover:bg-neutral-800 shadow-brand-dark/20'
                            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                        <span>{isSubmitting ? 'Submitting Report...' : 'Submit Takedown Notice'}</span>
                        {!isSubmitting && isFormValid && <ArrowRight size={18} />}
                    </button>
                    <p className="text-center text-xs text-zinc-400 mt-3 font-medium">
                        By clicking submit, you agree to our Terms of Service and swear under penalty of perjury that the information provided is accurate.
                    </p>
                </div>
            </div>
        </div>
    );
}
