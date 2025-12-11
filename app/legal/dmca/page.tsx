
import React from 'react';
import DMCAForm from '@/components/DMCAForm';

export default function DMCA() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-300 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">DMCA Takedown Request</h1>

            <p>
                TamilRing respects the intellectual property rights of others. We comply with the Digital Millennium Copyright Act (DMCA).
            </p>

            <DMCAForm />
        </div>
    );
}
