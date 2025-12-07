import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'User Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { username: string } }) {
    const { username } = params;
    const userId = decodeURIComponent(username);

    // Initialize Supabase in Edge Runtime
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    const name = profile?.full_name || 'User Profile';
    const avatar = profile?.avatar_url;

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#09090b',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.1), transparent)',
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={avatar}
                            alt={name}
                            style={{ width: 150, height: 150, borderRadius: 150, border: '4px solid #18181b', objectFit: 'cover', marginBottom: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        />
                    ) : (
                        <div style={{ width: 150, height: 150, borderRadius: 150, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 60, color: '#52525b' }}>?</span>
                        </div>
                    )}

                    <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {name}
                    </div>

                    <div style={{ fontSize: 24, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 4 }}>
                        TamilRing Creator
                    </div>

                    <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
                        <div style={{ padding: '10px 20px', background: '#10b981', color: 'black', borderRadius: 20, fontSize: 20, fontWeight: 'bold' }}>
                            View Profile
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
