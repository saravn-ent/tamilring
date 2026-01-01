import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types (strict whitelist)
const ALLOWED_MIME_TYPES = [
    'audio/mpeg',      // MP3
    'audio/mp4',       // M4A, M4R
    'audio/x-m4a',     // M4A alternative
    'audio/wav',       // WAV
    'audio/x-wav',     // WAV alternative
    'audio/aac',       // AAC
];

// Magic bytes for audio file validation
const AUDIO_SIGNATURES = {
    mp3: [0xFF, 0xFB],           // MP3 (MPEG-1 Layer 3)
    mp3_id3: [0x49, 0x44, 0x33], // MP3 with ID3v2 tag
    m4a: [0x00, 0x00, 0x00],     // M4A/MP4 (ftyp)
    wav: [0x52, 0x49, 0x46, 0x46], // WAV (RIFF)
    aac: [0xFF, 0xF1],           // AAC (ADTS)
    aac_alt: [0xFF, 0xF9],       // AAC (ADTS alternative)
};

/**
 * Validate file magic bytes (file signature)
 * This prevents attackers from uploading malicious files with fake extensions
 */
function validateMagicBytes(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer.slice(0, 12));

    // Check MP3 signatures
    if ((bytes[0] === 0xFF && bytes[1] === 0xFB) ||
        (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33)) {
        return true;
    }

    // Check M4A/MP4 signature (ftyp box)
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
        return true;
    }

    // Check WAV signature
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        return true;
    }

    // Check AAC signatures
    if ((bytes[0] === 0xFF && bytes[1] === 0xF1) ||
        (bytes[0] === 0xFF && bytes[1] === 0xF9)) {
        return true;
    }

    return false;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
        .replace(/\.\./g, '_')             // Prevent path traversal
        .replace(/^\.+/, '')               // Remove leading dots
        .substring(0, 100);                // Limit length
}

/**
 * Validate file upload
 * Returns error message if invalid, null if valid
 */
async function validateUpload(file: File): Promise<string | null> {
    // 1. Check file size
    if (file.size > MAX_FILE_SIZE) {
        return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    if (file.size === 0) {
        return 'File is empty';
    }

    // 2. Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return `Invalid file type: ${file.type}. Only audio files are allowed.`;
    }

    // 3. Check file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'm4r'];
    if (!ext || !allowedExtensions.includes(ext)) {
        return `Invalid file extension: .${ext}. Allowed: ${allowedExtensions.join(', ')}`;
    }

    // 4. Validate magic bytes (file signature)
    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer)) {
        return 'Invalid audio file format. File signature does not match audio file.';
    }

    return null; // Valid
}

import { ratelimit } from '@/lib/rate-limit';

/**
 * Rate limiting check
 */
async function checkRateLimit(userId: string): Promise<boolean> {
    const { success } = await ratelimit.limit(`upload_limit:${userId}`);
    return success;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for server-side
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check rate limits
        const rateLimitOk = await checkRateLimit(user.id);
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // 3. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 4. Validate file
        const validationError = await validateUpload(file);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // 5. Sanitize filename
        const safeFilename = sanitizeFilename(file.name);
        const timestamp = Date.now();
        const finalFilename = `${user.id}/${timestamp}-${safeFilename}`;

        // 6. Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('ringtone-files')
            .upload(finalFilename, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Upload failed. Please try again.' },
                { status: 500 }
            );
        }

        // 7. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('ringtone-files')
            .getPublicUrl(finalFilename);

        return NextResponse.json({
            success: true,
            filename: finalFilename,
            url: publicUrl,
            size: file.size
        });

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


// Configuration handled automatically by App Router

