
try {
  const authHelpers = require('@supabase/auth-helpers-nextjs');
  console.log('Exports:', Object.keys(authHelpers));
} catch (e) {
  console.error('Error loading module:', e);
}
