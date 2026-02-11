import NameRingtone from '@/components/NameRingtone';

export const metadata = {
    title: 'Name Ringtone Studio - Create Custom AI Ringtones | TamilRing',
    description: 'Create professional quality name ringtones with background music in seconds. Support for Tamil, Hindi, Malayalam, Telugu and more.',
};

export default function StudioNameRingtonePage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        <span className="text-rose-500">AI</span> Studio
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        Design your perfect ringtone with our advanced neural text-to-speech engine and professional audio mixing suite.
                    </p>
                </header>
                <NameRingtone />
            </div>
        </div>
    );
}
