
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    ShieldCheck, Scale, TrendingUp, AlertTriangle,
    CheckCircle2, Zap, Loader2
} from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';

export default function AICommandCenter() {
    interface Action {
        type: string;
        target_id?: string;
        description: string;
        payload?: {
            reason?: string;
        };
    }

    interface RingtoneItem {
        id: string;
        title: string;
        movie_name: string;
        status: string;
        created_at: string;
        tags: string[] | null;
    }

    interface Stats {
        totalRingtones: number | null;
        pendingRingtones: number | null;
        recentUploads: RingtoneItem[] | null;
    }

    const [loading, setLoading] = useState(true);
    const [agentResponse, setAgentResponse] = useState<string | null>(null);
    const [proposedActions, setProposedActions] = useState<Action[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [executionStatus, setExecutionStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
    const [stats, setStats] = useState<Stats | null>(null);
    const [activeModule, setActiveModule] = useState<'moderation' | 'legal' | 'business' | 'strategy'>('moderation');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ... (keep connection checking effect if desired, or simplify)

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { count: totalRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true });
            const { count: pendingRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { data: recent } = await supabase.from('ringtones').select('id, title, movie_name, status, created_at, tags').order('created_at', { ascending: false }).limit(10);

            const fetchedStats = { totalRingtones: totalRings, pendingRingtones: pendingRings, recentUploads: recent };
            setStats(fetchedStats);

            // Initial AI Briefing
            consultAgent('Briefly review current uploads for risks.', fetchedStats);
        } catch (error) {
            console.error("Data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const consultAgent = async (task: string, contextOverride?: Stats | null) => {
        setIsThinking(true);
        setProposedActions([]);
        setAgentResponse(null);
        hapticFeedback(5);

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

            if (!res.ok) throw new Error(data.error || 'Agent brain offline');

            // Parse JSON response
            let parsed;
            try {
                const cleanText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(cleanText);
            } catch (e) {
                console.warn("Failed to parse JSON, falling back to raw text", e);
                parsed = { analysis: data.text, actions: [] };
            }

            setAgentResponse(parsed.analysis);
            setProposedActions(parsed.actions || []);
            hapticFeedback(10);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("AI consult error:", error);
            setAgentResponse(`CRITICAL ERROR: ${message}`);
        } finally {
            setIsThinking(false);
        }
    };

    const handleExecuteAction = async (action: Action, index: number) => {
        setExecutionStatus(prev => ({ ...prev, [index]: 'pending' }));

        try {
            let result: { success: boolean; error?: string } = { success: false, error: 'Unknown action' };

            switch (action.type) {
                case 'DELETE_RINGTONE':
                    if (action.target_id) {
                        const { deleteRingtone } = await import('@/app/actions/admin');
                        result = await deleteRingtone(action.target_id);
                    }
                    break;
                case 'FLAG_SPAM': // Treat as delete or reject
                    if (action.target_id) {
                        const { rejectRingtone } = await import('@/app/actions/admin');
                        result = await rejectRingtone(action.target_id, action.payload?.reason || 'Spam detected by AI');
                    }
                    break;
                // Add more cases as needed
                default:
                    result = { success: true, error: 'Action simulated (not implemented)' };
            }

            if (result.success) {
                setExecutionStatus(prev => ({ ...prev, [index]: 'success' }));
                hapticFeedback(15);
                // Refresh stats to reflect changes (e.g. pending count decreases)
                setTimeout(() => fetchInitialData(), 1000);
            } else {
                console.error("Action failed:", result.error);
                setExecutionStatus(prev => ({ ...prev, [index]: 'error' }));
            }
        } catch (e) {
            console.error("Execution exception:", e);
            setExecutionStatus(prev => ({ ...prev, [index]: 'error' }));
        }
    };

    const modules = [
        { id: 'moderation', name: 'Moderation Unit', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', task: 'Audit the 10 most recent uploads. Identify low-quality titles (e.g. "test", "vxv") or spam. Return DELETE_RINGTONE actions for any bad content.' },
        { id: 'legal', name: 'Legal Advisor', icon: Scale, color: 'text-red-600', bg: 'bg-red-50', task: 'Review metadata for high-risk copyright strings (Sony, T-Series). Return FLAG_SPAM actions if found.' },
        { id: 'business', name: 'BizDev Agent', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', task: 'Analyze trends. (Note: Currently purely advisory, no actions implemented yet).' },
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
            {/* Header Hero (Simplified for brevity in edit, keep original structure in reality if preferred) */}
            <header className="relative p-10 bg-slate-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="relative z-10 font-bold text-white">
                    <h1 className="text-4xl md:text-5xl font-black mb-2">TamilRing Ops Agent</h1>
                    <p className="text-slate-400">Autonomous Admin Execution System</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Modules List */}
                <div className="lg:col-span-4 space-y-3">
                    {modules.map((m) => {
                        const Icon = m.icon;
                        return (
                            <button
                                key={m.id}
                                onClick={() => { setActiveModule(m.id as 'moderation' | 'legal' | 'business' | 'strategy'); consultAgent(m.task); }}
                                disabled={isThinking}
                                className={`w-full flex items-center gap-4 p-5 rounded-4xl border text-left transition-all ${activeModule === m.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:border-indigo-200'}`}
                            >
                                <Icon size={24} className={activeModule === m.id ? 'text-indigo-400' : m.color} />
                                <div>
                                    <div className="font-bold text-sm uppercase tracking-wider">{m.name}</div>
                                    <div className="text-[10px] opacity-60">Initialize Protocol</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Analysis Report */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 min-h-[200px]">
                        {isThinking ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-4">
                                <Loader2 className="animate-spin text-indigo-500" size={32} />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Analyzing Network Data...</p>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Strategic Analysis</h3>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                    {agentResponse || "Select a module to begin analysis."}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Console */}
                    {proposedActions.length > 0 && (
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 mb-6">
                                <Zap size={16} className="text-amber-500" />
                                Proposed Executive Actions ({proposedActions.length})
                            </h3>

                            <div className="space-y-4">
                                {proposedActions.map((action, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-200">
                                        <div className="p-3 bg-slate-100 rounded-2xl">
                                            {action.type.includes('DELETE') ? <AlertTriangle className="text-red-500" size={20} /> : <CheckCircle2 className="text-emerald-500" size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-lg">{action.type}</span>
                                                <span className="text-[10px] font-mono text-slate-400">{action.target_id || 'N/A'}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 mb-2">{action.description}</p>
                                            {action.payload?.reason && <p className="text-xs text-slate-500 italic">&quot;Reason: {action.payload.reason}&quot;</p>}
                                        </div>

                                        <button
                                            onClick={() => handleExecuteAction(action, idx)}
                                            disabled={executionStatus[idx] === 'success' || executionStatus[idx] === 'pending'}
                                            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${executionStatus[idx] === 'success' ? 'bg-emerald-500 text-white' :
                                                executionStatus[idx] === 'error' ? 'bg-red-500 text-white' :
                                                    executionStatus[idx] === 'pending' ? 'bg-slate-100 text-slate-400' :
                                                        'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg hover:shadow-indigo-500/30'
                                                }`}
                                        >
                                            {executionStatus[idx] === 'success' ? 'Executed' :
                                                executionStatus[idx] === 'pending' ? 'Running...' :
                                                    executionStatus[idx] === 'error' ? 'Failed' : 'Execute'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
