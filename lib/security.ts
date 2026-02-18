
/**
 * Server-side verification for Cloudflare Turnstile
 */
export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('Missing TURNSTILE_SECRET_KEY in environment variables');
    // In dev, we might want to bypass or warn
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}
