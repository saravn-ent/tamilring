import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || '016c4e2bed50cc4632ce47b6c7765fce';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'tamilring-media';
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-7adb3d7983ad4219ac5d433a25c74aac.r2.dev';

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

/**
 * Uploads a file (Buffer or Uint8Array) to Cloudflare R2 and returns its public URL
 */
export async function uploadToR2({
    key,
    body,
    contentType,
    cacheControl = 'public, max-age=31536000, immutable'
}: {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
    cacheControl?: string;
}): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: cacheControl,
    });

    await r2Client.send(command);
    return getR2PublicUrl(key);
}

/**
 * Deletes a single object from Cloudflare R2 by key
 */
export async function deleteFromR2(key: string): Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        await r2Client.send(command);
        return true;
    } catch (err) {
        console.error('Failed to delete from R2:', key, err);
        return false;
    }
}

/**
 * Deletes multiple objects from Cloudflare R2
 */
export async function deleteManyFromR2(keys: string[]): Promise<boolean> {
    if (!keys || keys.length === 0) return true;
    try {
        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: keys.map(k => ({ Key: k })),
            }
        });
        await r2Client.send(command);
        return true;
    } catch (err) {
        console.error('Failed to bulk delete from R2:', err);
        return false;
    }
}

/**
 * Returns the public URL for an R2 key
 */
export function getR2PublicUrl(key: string): string {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${cleanKey}`;
}

/**
 * Extracts R2 key from a public URL if it points to R2
 */
export function extractR2Key(url: string): string | null {
    if (!url) return null;
    if (url.includes('.r2.dev/') || url.includes('.r2.cloudflarestorage.com/')) {
        const parts = url.split('.r2.dev/');
        if (parts.length > 1) return parts[1];
        const s3Parts = url.split(`/${bucketName}/`);
        if (s3Parts.length > 1) return s3Parts[1];
    }
    return null;
}
