
require('dotenv').config({ path: '.env.local' });

console.log('Checking Environment Variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');

if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
    console.log('DATABASE_URL is pointing to:', isLocal ? 'Localhost' : 'Remote/Other');
}
