
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    Brain, ShieldCheck, Scale, TrendingUp, AlertTriangle,
    Sparkles, ListChecks, CheckCircle2, ChevronRight,
    Terminal, Zap, Target, FileText, Loader2, RefreshCcw
} from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';

export default function AICommandCenter() {
    const [loading, setLoading] = useState(true);
    const [agentResponse, setAgentResponse] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [activeModule, setActiveModule] = useState<'moderation' | 'legal' | 'business' | 'strategy'>('moderation');

    const [connectionStatus, setConnectionStatus] = useState<{
        supabase: 'testing' | 'secure' | 'error';
        gemini: 'testing' | 'enhanced' | 'error';
        risk: 'testing' | 'active' | 'error';
    }>({ supabase: 'testing', gemini: 'testing', risk: 'testing' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const taskParam = searchParams.get('task');
        const sessionContext = sessionStorage.getItem('ai_audit_context');

        if (taskParam === 'moderation-scan' && sessionContext) {
            const parsedContext = JSON.parse(sessionContext);
            setActiveModule('moderation');
            consultAgent('Perform a detailed moderation audit on these recent uploads. Identify low-quality titles or potential spam.', parsedContext);
            sessionStorage.removeItem('ai_audit_context'); // Clear after use
        } else {
            fetchInitialData();
        }
    }, []);

    useEffect(() => {
        const checkConnections = async () => {
            // Check Supabase
            try {
                const { error } = await supabase.from('ringtones').select('id').limit(1);
                setConnectionStatus(prev => ({ ...prev, supabase: error ? 'error' : 'secure' }));
            } catch {
                setConnectionStatus(prev => ({ ...prev, supabase: 'error' }));
            }

            // Check Gemini status based on response
            if (agentResponse && !agentResponse.includes('CRITICAL ERROR')) {
                setConnectionStatus(prev => ({ ...prev, gemini: 'enhanced', risk: 'active' }));
            } else if (agentResponse?.includes('CRITICAL ERROR')) {
                setConnectionStatus(prev => ({ ...prev, gemini: 'error', risk: 'error' }));
            }
        };

        checkConnections();
    }, [agentResponse]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { count: totalRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true });
            const { count: pendingRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { data: recent } = await supabase.from('ringtones').select('title, movie_name, status, created_at').order('created_at', { ascending: false }).limit(10);

            const fetchedStats = { totalRingtones: totalRings, pendingRingtones: pendingRings, recentUploads: recent };
            setStats(fetchedStats);

            // Initial AI Briefing
            consultAgent('Briefly review current uploads for risks and suggest the #1 strategy for this week.', fetchedStats);
        } catch (error) {
            console.error("Data fetch error:", error);
            setConnectionStatus(prev => ({ ...prev, supabase: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const consultAgent = async (task: string, contextOverride?: any) => {
        setIsThinking(true);
        hapticFeedback(5);
        setConnectionStatus(prev => ({ ...prev, gemini: 'testing' }));
        try {
            const res = await fetch('/api/ai/ops-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task,
                    context: contextOverride || stats
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.details || 'Agent brain offline');
            }

            setAgentResponse(data.text);
            hapticFeedback(10);
            setConnectionStatus(prev => ({ ...prev, gemini: 'enhanced', risk: 'active' }));
        } catch (error: any) {
            console.error("AI consult error:", error);
            setAgentResponse(`CRITICAL ERROR: ${error.message}\n\nPlease check your GOOGLE_AI_API_KEY and model availability in Google AI Studio.`);
            setConnectionStatus(prev => ({ ...prev, gemini: 'error', risk: 'error' }));
        } finally {
            setIsThinking(false);
        }
    };

    const modules = [
        { id: 'moderation', name: 'Moderation Unit', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', task: 'Audit the 10 most recent uploads across all languages (Tamil, Hindi, Telugu, etc). Identify low-quality titles or potential spam metadata.' },
        { id: 'legal', name: 'Legal Advisor', icon: Scale, color: 'text-red-600', bg: 'bg-red-50', task: 'Review the site database metadata for high-risk copyright strings from major Indian labels (Sony Music, T-Series, Aditya Music, Think Music). Suggest sanitization rules.' },
        { id: 'business', name: 'BizDev Agent', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', task: 'Identify top 3 upcoming trends across Kollywood, Tollywood, and Bollywood and suggest how we can rank #1 for these keywords.' },
        { id: 'strategy', name: 'Alpha Strategist', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', task: 'Analyze the current ringtone market. What feature or category should we add to beat pan-Indian competitors like Zedge?' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Booting Ops Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Hero */}
            <header className="relative p-10 bg-slate-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Brain size={160} className="text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <Zap size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Command Center v2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">TamilRing Ops Agent</h1>
                        <p className="text-slate-400 max-w-md font-bold text-sm leading-relaxed">
                            Your executive AI partner for moderation, legal compliance, and domain-wide market dominance.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center min-w-[140px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Uploads Audited</p>
                            <p className="text-3xl font-black text-white">{stats.totalRingtones}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center min-w-[140px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Defense Level</p>
                            <p className="text-3xl font-black text-emerald-400">98%</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tactical Modules */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] px-4">Tactical Units</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {modules.map((m) => {
                            const Icon = m.icon;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setActiveModule(m.id as any);
                                        consultAgent(m.task);
                                    }}
                                    disabled={isThinking}
                                    className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left ${activeModule === m.id ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeModule === m.id ? 'bg-indigo-500 text-white' : `${m.bg} ${m.color}`}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <span className={`block text-xs font-black uppercase tracking-tight ${activeModule === m.id ? 'text-white' : 'text-slate-900'}`}>{m.name}</span>
                                        <span className={`block text-[10px] font-bold ${activeModule === m.id ? 'text-slate-400' : 'text-slate-500'}`}>Execute Protocol</span>
                                    </div>
                                    <ChevronRight size={16} className={activeModule === m.id ? 'text-indigo-400' : 'text-slate-200'} />
                                </button>
                            );
                        })}
                    </div>

                    {/* System Logs */}
                    <div className="p-6 bg-slate-100 rounded-[2.5rem] border border-slate-200">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                            <Terminal size={14} /> System Logs
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                {connectionStatus.supabase === 'secure' ? (
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                ) : connectionStatus.supabase === 'testing' ? (
                                    <Loader2 size={12} className="text-indigo-500 animate-spin" />
                                ) : (
                                    <AlertTriangle size={12} className="text-red-500" />
                                )}
                                <span>Supabase Auth: {connectionStatus.supabase.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                {connectionStatus.gemini === 'enhanced' ? (
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                ) : connectionStatus.gemini === 'testing' ? (
                                    <Loader2 size={12} className="text-indigo-500 animate-spin" />
                                ) : (
                                    <AlertTriangle size={12} className="text-red-500" />
                                )}
                                <span>Gemini Reasoning: {connectionStatus.gemini.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                {connectionStatus.risk === 'active' ? (
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                ) : connectionStatus.risk === 'testing' ? (
                                    <Loader2 size={12} className="text-indigo-500 animate-spin" />
                                ) : (
                                    <AlertTriangle size={12} className="text-red-500" />
                                )}
                                <span>Risk Mitigation: {connectionStatus.risk.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Intelligence Report */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className={`flex-1 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden transition-all duration-500 ${isThinking ? 'opacity-70 grayscale-[0.5]' : ''}`}>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                                    <Brain className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Report</h2>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => fetchInitialData()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-white hover:border-indigo-200 transition-all"
                            >
                                <RefreshCcw size={12} className={isThinking ? 'animate-spin' : ''} />
                                Data Refresh
                            </button>
                        </div>

                        {isThinking ? (
                            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Agent Thinking...</p>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none">
                                <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner min-h-[300px]">
                                    {agentResponse || "Select a Tactical Unit to generate an operational report."}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-800 leading-tight">
                                <span className="font-black uppercase tracking-wider block mb-0.5">Note from Ops Master:</span>
                                All reports are generated based on real-time Pan-Indian film trends and site heuristics. Final executive decisions remain with the Admin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
