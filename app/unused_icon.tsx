import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 512,
    height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: '#09090b', // neutral-950
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: 64, // Rounded corners for icon style (optional, but nice)
                    fontWeight: 800,
                    position: 'relative',
                }}
            >
                {/* Waveform Background/Effect */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, position: 'absolute', bottom: 40, opacity: 0.2 }}>
                    {[40, 60, 90, 60, 40, 80, 50, 70, 40].map((h, i) => (
                        <div key={i} style={{ width: 12, height: h * 1.5, background: '#10b981', borderRadius: 4 }} />
                    ))}
                </div>

                {/* Text Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.85, zIndex: 10 }}>
                    <div style={{ color: '#10b981', letterSpacing: '-0.05em' }}>Tamil</div>
                    <div style={{ color: '#ffffff', letterSpacing: '-0.05em' }}>Ring</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
