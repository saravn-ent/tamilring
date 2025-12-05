import React from 'react';

export default function DMCAPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-zinc-100">DMCA / Copyright Policy</h1>
            <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 mb-4">
                    TamilRing respects the intellectual property rights of others and expects its users to do the same.
                    It is our policy to respond to clear notices of alleged copyright infringement that comply with the
                    Digital Millennium Copyright Act (DMCA).
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">Reporting Infringement</h2>
                <p className="text-zinc-300 mb-4">
                    If you believe that your work has been copied in a way that constitutes copyright infringement,
                    please provide us with the following information:
                </p>
                <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-2">
                    <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                    <li>Identification of the copyrighted work claimed to have been infringed.</li>
                    <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled.</li>
                    <li>Information reasonably sufficient to permit us to contact you, such as an email address or telephone number.</li>
                    <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">Contact</h2>
                <p className="text-zinc-300">
                    Notices of copyright infringement should be sent to: <a href="mailto:support@tamilring.com" className="text-emerald-500 hover:text-emerald-400">support@tamilring.com</a>
                </p>
            </div>
        </div>
    );
}
