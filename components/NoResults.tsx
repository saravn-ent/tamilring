
import { Search } from 'lucide-react';

interface NoResultsProps {
    query: string;
}

export default function NoResults({ query }: NoResultsProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-zinc-100 p-6 rounded-full border border-zinc-200">
                <Search className="w-10 h-10 text-zinc-400" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#15171A]">No matches found</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto px-4">
                    We couldn't find any ringtones, movies, or artists matching <span className="text-[#3EB0EF] font-medium">"{query}"</span>.
                </p>
            </div>
            <p className="text-xs text-zinc-600">Try checking the spelling or use fewer keywords.</p>
        </div>
    );
}
