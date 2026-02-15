
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Music, Type, Phone, Download, Play, Pause, Loader2, ArrowLeft, CheckCircle2, ChevronRight, Wand2, HelpCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { hapticFeedback } from '@/lib/haptics';
import SetRingtoneModal from '@/components/ringtone/SetRingtoneModal';
import { detectLanguage } from '@/lib/utils/lang-detect';
import { transliterate } from '@/lib/utils/translit';

interface Ringtone {
    id: string;
    title: string;
    movieName?: string;
    audioUrl: string;
}

interface FFmpegInstance {
    isLoaded: () => boolean;
    load: () => Promise<void>;
    FS: (method: string, filename: string, data?: Uint8Array | string) => unknown;
    run: (...args: string[]) => Promise<void>;
}

interface WindowWithFFmpeg extends Window {
    FFmpeg?: {
        createFFmpeg: (options: { log: boolean; corePath: string; mainName: string }) => FFmpegInstance;
        fetchFile: (url: string) => Promise<Uint8Array>;
    };
}

const backgroundTracks = [
    { id: 'romantic', name: 'Romantic', file: '/audio/romantic.mp3', color: 'bg-pink-500', shadow: 'shadow-pink-500/20', gradient: 'from-pink-500 to-rose-500' },
    { id: 'corporate', name: 'Corporate', file: '/audio/corporate.mp3', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', gradient: 'from-indigo-500 to-blue-600' },
    { id: 'happy', name: 'Happy', file: '/audio/happy.mp3', color: 'bg-amber-500', shadow: 'shadow-amber-500/20', gradient: 'from-amber-500 to-orange-500' },
    { id: 'lofi', name: 'Lofi', file: '/audio/lofi.mp3', color: 'bg-purple-500', shadow: 'shadow-purple-500/20', gradient: 'from-purple-500 to-violet-500' },
    { id: 'none', name: 'No Music', file: null, color: 'bg-slate-400', shadow: 'shadow-slate-400/20', gradient: 'from-slate-400 to-slate-500' }
];

const templates = {
    ta: [
        { category: 'பொதுவான', text: "தயவுசெய்து உங்கள் போனை எடுக்கவும்" },
        { category: 'அவசரம்', text: "அவசரம்! உடனே போனை எடுக்கவும்" },
        { category: 'மாஸ்', text: "மாஸ் என்ட்ரி! போன் அடிக்கிறது பாருங்க" },
        { category: 'இனிமையான', text: "உங்களுக்காக ஒரு இனிமையான அழைப்பு" }
    ],
    en: [
        { category: 'General', text: "Please pick up your phone" },
        { category: 'Urgent', text: "Emergency! Answer the phone now" },
        { category: 'Hero', text: "Boss! Your phone is ringing" },
        { category: 'Sweet', text: "A sweet call is waiting for you" }
    ],
    hi: [
        { category: 'सामान्य', text: "कृपया अपना फोन उठाएं" },
        { category: 'जरूरी', text: "आपातकालीन! तुरंत फोन उठाएं" },
        { category: 'हीरो', text: "बॉस! आपका फोन बज रहा है" },
        { category: 'प्यारा', text: "आपके लिए एक मीठा कॉल है" }
    ],
    ml: [
        { category: 'പൊതുവായ', text: "ദയവായി നിങ്ങളുടെ ഫോൺ എടുക്കുക" },
        { category: 'അടിയന്തിരം', text: "അടിയന്തിരം! ഉടൻ ഫോൺ എടുക്കുക" },
        { category: 'ഹീറോ', text: "ബോസ്! നിങ്ങളുടെ ഫോൺ അടിക്കുന്നു" },
        { category: 'മധുരം', text: "നിങ്ങൾക്കായി ഒരു മധുരമുള്ള കോൾ" }
    ],
    te: [
        { category: 'సామాన్య', text: "దయచేసి మీ ఫోన్ ఎత్తండి" },
        { category: 'అత్యవసరం', text: "అత్యవసరం! వెంటనే ఫోన్ ఎత్తండి" },
        { category: 'హీరో', text: "బాస్! మీ ఫోన్ మోగుతోంది" },
        { category: 'తీపి', text: "మీ కోసం ఒక తీపి కాల్ వేచి ఉంది" }
    ],
    kn: [
        { category: 'ಸಾಮಾನ್ಯ', text: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಫೋನ್ ಎತ್ತಿ" },
        { category: 'ತುರ್ತು', text: "ತುರ್ತು! ತಕ್ಷಣ ಫೋನ್ ಎತ್ತಿ" },
        { category: 'ಹೀರೋ', text: "ಬಿಗ್ ಬಾಸ್! ನಿಮ್ಮ ಫೋನ್ ರಿಂಗಾಗುತ್ತಿದೆ" },
        { category: 'ಸಿಹಿ', text: "ನಿಮಗಾಗಿ ಒಂದು ಸಿಹಿ ಕರೆ ಇದೆ" }
    ],
    mr: [
        { category: 'सामान्य', text: "कृपया आपला फोन उचला" },
        { category: 'तातडीचे', text: "तात्काळ! फोन उचला" },
        { category: 'हिरो', text: "बॉस! तुमचा फोन वाजत आहे" },
        { category: 'गोड', text: "तुमच्यासाठी एक गोड कॉल आहे" }
    ],
    bn: [
        { category: 'সাধারণ', text: "দয়া করে আপনার ফোনটি ধরুন" },
        { category: 'জরুরি', text: "জরুরী! এখনই ফোন ধরুন" },
        { category: 'হিরো', text: "বস! আপনার ফোন বাজছে" },
        { category: 'মিষ্টি', text: "আপনার জন্য একটি মিষ্টি ফোন আছে" }
    ],
    es: [
        { category: 'General', text: "Por favor contesta tu teléfono" },
        { category: 'Urgente', text: "¡Emergencia! Contesta ahora" },
        { category: 'Héroe', text: "¡Jefe! Tu teléfono está sonando" },
        { category: 'Dulce', text: "Tienes una llamada dulce" }
    ],
    fr: [
        { category: 'Général', text: "S'il vous plaît décrochez votre téléphone" },
        { category: 'Urgent', text: "Urgence! Répondez maintenant" },
        { category: 'Héros', text: "Patron! Votre téléphone sonne" },
        { category: 'Doux', text: "Un appel doux vous attend" }
    ],
    ar: [
        { category: 'عام', text: "يرجى الرد على هاتفك" },
        { category: 'عاجل', text: "طارئ! أجب الآن" },
        { category: 'بطل', text: "المدير! هاتفك يرن" },
        { category: 'لطيف', text: "لديك مكالمة لطيفة" }
    ],
    gu: [
        { category: 'સામાન્ય', text: "કૃપા કરીને તમારો ફોન ઉપાડો" },
        { category: 'તાત્કાલિક', text: "તાત્કાલિક! હમણાં જ ફોન ઉપાડો" },
        { category: 'હીરો', text: "બોસ! તમારો ફોન રણકી રહ્યો છે" },
        { category: 'મીઠું', text: "તમારા માટે એક મીઠો કોલ છે" }
    ],
    pa: [
        { category: 'ਆਮ', text: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਫੋਨ ਚੁੱਕੋ" },
        { category: 'ਜ਼ਰੂਰੀ', text: "ਐਮਰਜੈਂਸੀ! ਹੁਣੇ ਫੋਨ ਚੁੱਕੋ" },
        { category: 'ਹੀਰੋ', text: "ਬੌਸ! ਤੁਹਾਡਾ ਫੋਨ ਵੱਜ ਰਿਹਾ ਹੈ" },
        { category: 'ਮਿੱਠਾ', text: "ਤੁਹਾਡੇ ਲਈ ਇੱਕ ਮਿੱਠੀ ਕਾਲ ਹੈ" }
    ]
};

const languages = [
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', glish: 'Tanglish' },
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी', glish: 'Hinglish' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം', glish: 'Manglish' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', glish: 'Tenglish' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', glish: 'Kanglish' },
    { id: 'mr', name: 'Marathi', native: 'मराठी', glish: 'Marathinglish' },
    { id: 'bn', name: 'Bengali', native: 'বাংলা', glish: 'Bonglish' },
    { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી', glish: 'Gujlish' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', glish: 'Punglish' },
    { id: 'es', name: 'Spanish', native: 'Español' },
    { id: 'fr', name: 'French', native: 'Français' },
    { id: 'ar', name: 'Arabic', native: 'العربية' }
];

export default function NameRingtone() {
    const [customMessage, setCustomMessage] = useState('');
    const [lang, setLang] = useState<string>('ta');

    const [selectedMusic, setSelectedMusic] = useState(backgroundTracks[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBgmModalOpen, setIsBgmModalOpen] = useState(false);
    const [bgmSearch, setBgmSearch] = useState('');
    const [isTransliterating, setIsTransliterating] = useState(false);

    const ffmpegRef = useRef<FFmpegInstance | null>(null);

    const bgAudioRef = useRef<HTMLAudioElement | null>(null);
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

    const [libraryRingtones, setLibraryRingtones] = useState<Ringtone[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const filteredLibrary = useMemo(() => {
        if (!bgmSearch.trim()) return libraryRingtones;
        const query = bgmSearch.toLowerCase();
        return libraryRingtones.filter(r =>
            r.title.toLowerCase().includes(query) ||
            (r.movieName && r.movieName.toLowerCase().includes(query))
        );
    }, [bgmSearch, libraryRingtones]);

    useEffect(() => {
        if (isBgmModalOpen && libraryRingtones.length === 0) {
            fetchLibrary();
        }
    }, [isBgmModalOpen, libraryRingtones.length]);

    const fetchLibrary = async () => {
        setIsLoadingLibrary(true);
        try {
            const res = await fetch('/api/ringtones?limit=20');
            const data = await res.json();
            setLibraryRingtones(data);
        } catch (error) {
            console.error("Failed to fetch library:", error);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    useEffect(() => {
        return () => {
            if (bgAudioRef.current) bgAudioRef.current.pause();
            if (ttsAudioRef.current) ttsAudioRef.current.pause();
        };
    }, []);

    const loadFFmpeg = async () => {
        if (ffmpegRef.current && ffmpegRef.current.isLoaded()) return ffmpegRef.current;
        const win = window as unknown as WindowWithFFmpeg;
        if (!win.FFmpeg) return null;
        const corePath = `${window.location.origin}/ffmpeg-st/ffmpeg-core.js`;
        try {
            const ffmpeg = win.FFmpeg.createFFmpeg({ log: false, corePath, mainName: 'main' });
            await ffmpeg.load();
            ffmpegRef.current = ffmpeg;
            return ffmpeg;
        } catch (err) {
            console.error("FFmpeg Load Error:", err);
            return null;
        }
    };

    const handleMessageChange = (val: string) => {
        setCustomMessage(val.replace(/[()]/g, ''));
    };

    const toggleLang = (val: string) => {
        setLang(val);
        hapticFeedback(5);
    };




    const handleTransliterate = async () => {
        if (!customMessage.trim() || isTransliterating) return;
        setIsTransliterating(true);
        hapticFeedback(10);
        try {
            const converted = await transliterate(customMessage, lang);
            setCustomMessage(converted);
        } catch (err) {
            console.error("Translit failed:", err);
        } finally {
            setIsTransliterating(false);
        }
    };

    const handlePreview = async () => {
        const fullMessage = customMessage.trim();
        if (!fullMessage) {
            alert(lang === 'ta' ? 'தயவுசெய்து செய்தியை உள்ளிடவும்!' : 'Please enter a message first!');
            return;
        }
        hapticFeedback(10);
        setIsGenerating(true);
        setIsPlaying(false);
        if (bgAudioRef.current) bgAudioRef.current.pause();
        if (ttsAudioRef.current) ttsAudioRef.current.pause();

        try {
            let messageToSpeak = fullMessage;
            if (lang !== 'en' && detectLanguage(fullMessage) === 'en') {
                setLoadingMessage(`Optimizing for ${languages.find(l => l.id === lang)?.name} Voice...`);
                messageToSpeak = await transliterate(fullMessage, lang);
            }
            const ttsUrl = `/api/proxy-audio?url=${encodeURIComponent(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(messageToSpeak)}&tl=${lang}&client=tw-ob`)}`;
            setPreviewUrl(ttsUrl);
            setIsPlaying(true);
            if (selectedMusic.file) {
                if (!bgAudioRef.current) bgAudioRef.current = new Audio(selectedMusic.file);
                else bgAudioRef.current.src = selectedMusic.file;
                bgAudioRef.current.volume = 0.3;
                bgAudioRef.current.loop = true;
                bgAudioRef.current.play().catch(e => console.error("BG Play error:", e));
            }
            const tts = new Audio(ttsUrl);
            ttsAudioRef.current = tts;
            tts.play().catch(e => console.error("TTS Play error:", e));
            tts.onended = () => {
                setIsPlaying(false);
                if (bgAudioRef.current) bgAudioRef.current.pause();
            };
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (format: 'mp3' | 'm4r') => {
        const fullMessage = customMessage.trim();
        if (!fullMessage || isGenerating) return;
        setIsGenerating(true);
        setLoadingMessage(`Mixing ${format.toUpperCase()}...`);
        hapticFeedback(10);
        try {
            const ffmpeg = await loadFFmpeg();
            if (!ffmpeg) throw new Error('FFmpeg not loaded');
            const win = window as unknown as WindowWithFFmpeg;
            if (!win.FFmpeg) throw new Error('FFmpeg fetchFile not found');
            const { fetchFile } = win.FFmpeg;
            let messageToSpeak = fullMessage;
            if (lang !== 'en' && detectLanguage(fullMessage) === 'en') {
                setLoadingMessage(`${languages.find(l => l.id === lang)?.name} Voice Optimization...`);
                messageToSpeak = await transliterate(fullMessage, lang);
            }
            const rawTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(messageToSpeak)}&tl=${lang}&client=tw-ob`;
            const ttsUrl = `/api/proxy-audio?url=${encodeURIComponent(rawTtsUrl)}`;
            setLoadingMessage('Fetching voice data...');
            ffmpeg.FS('writeFile', 'tts.mp3', await fetchFile(ttsUrl));
            if (selectedMusic.file) {
                setLoadingMessage('Fetching background music...');
                ffmpeg.FS('writeFile', 'bg.mp3', await fetchFile(selectedMusic.file));
                setLoadingMessage('Mastering audio layers...');
                await ffmpeg.run(
                    '-i', 'bg.mp3',
                    '-i', 'tts.mp3',
                    '-filter_complex', '[0:a]volume=0.2[bg];[1:a]adelay=1000|1000[voice];[bg][voice]amix=inputs=2:duration=shortest:dropout_transition=2',
                    '-c:a', format === 'm4r' ? 'aac' : 'libmp3lame',
                    '-b:a', '192k',
                    'output.' + format
                );
            } else {
                setLoadingMessage('Finalizing voice...');
                await ffmpeg.run('-i', 'tts.mp3', '-c:a', format === 'm4r' ? 'aac' : 'libmp3lame', 'output.' + format);
            }
            const data = ffmpeg.FS('readFile', 'output.' + format) as Uint8Array;
            const blob = new Blob([(data.buffer as ArrayBuffer)], { type: format === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TamilRing.in - Custom Ringtone.${format}`;
            a.click();
            ffmpeg.FS('unlink', 'tts.mp3');
            if (selectedMusic.file) ffmpeg.FS('unlink', 'bg.mp3');
            ffmpeg.FS('unlink', 'output.' + format);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Mixing failed. Please try again.');
        } finally {
            setIsGenerating(false);
            setLoadingMessage('');
        }
    };

    const togglePlayback = () => {
        if (!previewUrl) return;
        if (isPlaying) {
            if (bgAudioRef.current) bgAudioRef.current.pause();
            if (ttsAudioRef.current) ttsAudioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (bgAudioRef.current) bgAudioRef.current.play();
            if (ttsAudioRef.current) ttsAudioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <main className="pb-20">
            <div className="mb-2">
                <Link href="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
                    <ArrowLeft size={16} /> Back to Tools
                </Link>
            </div>

            <div className="max-w-xl mx-auto">
                <header className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="text-rose-500" size={18} />
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Name Ringtone</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Generator</p>
                </header>

                <div className="space-y-6">
                    {/* STEP 1: NAME & LANGUAGE */}
                    <section className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-5 h-5 bg-rose-500 text-white rounded-md flex items-center justify-center text-[9px]">1</div>
                                    Choose Language
                                </h3>
                                <div className="relative group">
                                    <select
                                        value={lang}
                                        onChange={(e) => toggleLang(e.target.value)}
                                        className="w-full h-14 pl-12 pr-10 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer group-hover:bg-white"
                                    >
                                        {languages.map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.name} {l.native ? `(${l.native}${l.glish ? ` / ${l.glish}` : ''})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-rose-500 pointer-events-none">
                                        <Type size={18} />
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-rose-500 transition-colors">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-5 h-5 bg-rose-500 text-white rounded-md flex items-center justify-center text-[9px]">2</div>
                                    Your Custom Message
                                </h3>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="relative">
                                        <textarea
                                            rows={4}
                                            placeholder="Enter your name or custom call message..."
                                            value={customMessage}
                                            onChange={(e) => handleMessageChange(e.target.value)}
                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-4xl text-base font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none shadow-sm"
                                        />
                                        <div className="absolute right-4 bottom-4 flex items-center gap-2">
                                            {lang !== 'en' && customMessage.trim() && detectLanguage(customMessage) === 'en' && (
                                                <button onClick={handleTransliterate} disabled={isTransliterating} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight shadow-xl transition-all">
                                                    {isTransliterating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                    Convert to {languages.find(l => l.id === lang)?.native}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-56 flex flex-col gap-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Quick Templates</h3>
                                    <div className="flex md:flex-wrap overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 scrollbar-none">
                                        {(templates[lang as keyof typeof templates] || templates.en).map((msg, idx) => (
                                            <button key={idx} onClick={() => setCustomMessage(msg.text)} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:border-rose-500 hover:text-rose-500 transition-all shrink-0 text-center">
                                                {msg.category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STEP 4: VISUAL CALLER PREVIEW */}
                    <div className="relative transition-all duration-500 hover:scale-[1.01]">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="text-white" size={64} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/40">
                                            <Phone className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-[13px] uppercase tracking-tight">Live Preview</h3>
                                            <p className="text-rose-400 text-[9px] font-black uppercase tracking-widest">Caller Setup</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`mb-4 relative transition-all duration-500 ${isPlaying ? 'scale-105' : ''}`}>
                                    <div className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.3em] text-center mb-2">Incoming Call</div>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        rows={2}
                                        className="w-full bg-transparent border-none text-white text-2xl md:text-3xl font-black text-center placeholder:text-white/20 focus:outline-none focus:ring-0 resize-none h-auto min-h-[80px] leading-tight"
                                        placeholder="Type your name..."
                                    />
                                    <div className={`w-24 h-1 mx-auto rounded-full mt-4 transition-all duration-500 ${isPlaying ? 'bg-rose-500 w-32 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-white/10'}`} />
                                    {isPlaying && (
                                        <div className="flex justify-center gap-1 mt-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="w-1 bg-rose-500 animate-pulse" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 5: BACKGROUND MUSIC */}
                    <section className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center text-[10px] font-black">03</div>
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pick Your Mood</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {backgroundTracks.map((track) => (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedMusic(track)}
                                    className={`relative group h-16 rounded-2xl border transition-all overflow-hidden flex flex-col items-center justify-center gap-1 ${selectedMusic.id === track.id ? 'border-slate-900 bg-white ring-2 ring-slate-900/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${track.color} mb-0.5`} />
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMusic.id === track.id ? 'text-slate-900' : 'text-slate-500'}`}>{track.name}</span>
                                    {selectedMusic.id === track.id && <div className="absolute top-1 right-1"><CheckCircle2 size={10} className="text-slate-900" /></div>}
                                </button>
                            ))}
                            <button onClick={() => setIsBgmModalOpen(true)} className="h-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-1">
                                <Search size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 text-center leading-none">Choose from<br />Site Library</span>
                            </button>
                        </div>
                    </section>

                    {/* STEP 6: AI STUDIO MASTER */}
                    <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="text-white" size={64} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 text-xs font-black">04</div>
                                <div className="flex-1">
                                    <h3 className="text-white font-black text-sm uppercase tracking-tight">Studio Master</h3>
                                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Final Audio Engine</p>
                                </div>
                            </div>
                            {!previewUrl ? (
                                <button
                                    onClick={handlePreview}
                                    disabled={isGenerating || !customMessage.trim()}
                                    className={`w-full h-20 rounded-4xl flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl ${!customMessage.trim() || isGenerating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-rose-500 hover:text-white shadow-xl active:scale-[0.98]'}`}
                                >
                                    {isGenerating ? <><Loader2 className="animate-spin" size={24} /> {loadingMessage || 'Mixing Audio...'}</> : <><Sparkles size={24} /> Generate Ringtone</>}
                                </button>
                            ) : (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <button onClick={togglePlayback} className="w-full h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                                        {isPlaying ? 'Pause' : 'Play Preview'}
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleDownload('mp3')} className="h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border border-white/5"><Download size={18} /> Android MP3</button>
                                        <button onClick={() => handleDownload('m4r')} className="h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border border-white/5"><Download size={18} /> iPhone M4R</button>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <button onClick={handlePreview} disabled={isGenerating} className="flex-1 py-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center justify-center gap-2"><Wand2 size={14} /> Update Audio</button>
                                            <div className="w-px h-4 bg-white/5" />
                                            <button onClick={() => setPreviewUrl(null)} className="flex-1 py-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center justify-center gap-2"><X size={14} /> Reset</button>
                                        </div>
                                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-rose-400 transition-colors py-2 group mx-auto uppercase tracking-widest">
                                            <HelpCircle size={16} className="group-hover:animate-pulse text-slate-600" />
                                            <span>How to set Ringtone?</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* INFO SECTION */}
            <div className="mt-12 p-8 bg-slate-100/50 rounded-[3rem] border border-slate-200/50 text-center max-w-xl mx-auto">
                <Music className="mx-auto text-slate-300 mb-4" size={32} />
                <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">Professional Quality</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                    Combine ultra-realistic AI voices with high-fidelity studio background music. Perfect for personalized ringtones.
                </p>
            </div>

            {/* BGM LIBRARY MODAL */}
            {
                isBgmModalOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Site Library</h2>
                                <button onClick={() => setIsBgmModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 bg-slate-50 border-b border-slate-100">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search songs or movies..."
                                        value={bgmSearch}
                                        onChange={(e) => setBgmSearch(e.target.value)}
                                        className="w-full h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {isLoadingLibrary ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                                        <Loader2 className="animate-spin" size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Accessing Vault...</span>
                                    </div>
                                ) : filteredLibrary.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredLibrary.map((r: Ringtone) => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setSelectedMusic({ id: r.id, name: r.title, file: r.audioUrl, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', gradient: 'from-indigo-500 to-blue-600' });
                                                    setIsBgmModalOpen(false);
                                                }}
                                                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Music size={16} className="text-indigo-500" /></div>
                                                <div className="flex-1">
                                                    <h4 className="text-[11px] font-black text-slate-900 leading-tight line-clamp-1">{r.title}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{r.movieName || 'Single'}</p>
                                                </div>
                                                <ChevronRight size={12} className="text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Music className="mx-auto text-slate-200 mb-2" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matches found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <Script src="/ffmpeg/ffmpeg.min.js" strategy="afterInteractive" onLoad={() => { const win = window as unknown as WindowWithFFmpeg; if (win.FFmpeg) loadFFmpeg(); }} />
            <SetRingtoneModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main >
    );
}
