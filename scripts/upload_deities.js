const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://dfcvrisaejumfpjmalui.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const mappings = [
    { name: 'Murugan', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/murugan_symbol_profile_1769526755400.png' },
    { name: 'Vinayagar', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/vinayagar_profile_1769529052352.png' },
    { name: 'Siva', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/siva_profile_1769529134263.png' },
    { name: 'Krishna', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/krishna_profile_1769529233881.png' },
    { name: 'Amman', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/amman_profile_1769529300474.png' },
    { name: 'Jesus', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/jesus_profile_1769529515491.png' },
    { name: 'Allah', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/allah_profile_1769529573856.png' },
    { name: 'Buddha', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/buddha_profile_1769529652488.png' },
    { name: 'Vishnu', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/vishnu_profile_1769529706675.png' },
    { name: 'Hanuman', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/hanuman_profile_1769529779590.png' },
    { name: 'Ayyappan', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/ayyappan_profile_1769529823427.png' },
    { name: 'Sai Baba', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/sai_baba_profile_1769529871909.png' },
    { name: 'Ambedkar', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/ambedkar_profile_1769529912566.png' },
    { name: 'Natarajar', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/natarajar_profile_1769529943124.png' },
    { name: 'Venkateswara', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/venkateswara_profile_1769529978045.png' },

    // Aliases reusing existing images
    { name: 'Mariamman', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/amman_profile_1769529300474.png' },
    { name: 'Muthumariamman', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/amman_profile_1769529300474.png' },
    { name: 'Durga', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/amman_profile_1769529300474.png' },
    { name: 'Perumal', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/vishnu_profile_1769529706675.png' },
    { name: 'Ranganathar', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/vishnu_profile_1769529706675.png' },
    { name: 'Narasimha', path: 'C:/Users/sarav/.gemini/antigravity/brain/e8abcf24-c1f9-451f-b991-d195a055ba22/vishnu_profile_1769529706675.png' },
];

async function main() {
    // Ensure bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'deities')) {
        console.log('Creating "deities" bucket...');
        const { error: createError } = await supabase.storage.createBucket('deities', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        });
        if (createError) console.error('Error creating bucket:', createError.message);
    } else {
        console.log('"deities" bucket exists.');
    }

    for (const item of mappings) {
        try {
            if (!fs.existsSync(item.path)) {
                console.error(`File not found: ${item.path}`);
                continue;
            }

            const fileBuffer = fs.readFileSync(item.path);
            const fileName = `auto_${item.name.toLowerCase().replace(/\s+/g, '_')}.png`;

            console.log(`Uploading ${item.name}...`);

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('deities')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                console.error(`Upload error for ${item.name}:`, uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabase
                .storage
                .from('deities')
                .getPublicUrl(fileName);

            const { data: existing } = await supabase
                .from('deity_images')
                .select('id')
                .eq('deity_name', item.name)
                .single();

            if (existing) {
                const { error: updateError } = await supabase
                    .from('deity_images')
                    .update({ image_url: publicUrl })
                    .eq('id', existing.id);

                if (updateError) console.error(`DB Update error for ${item.name}:`, updateError.message);
                else console.log(`Updated ${item.name}`);
            } else {
                const { error: insertError } = await supabase
                    .from('deity_images')
                    .insert({
                        deity_name: item.name,
                        image_url: publicUrl
                    });

                if (insertError) console.error(`DB Insert error for ${item.name}:`, insertError.message);
                else console.log(`Inserted ${item.name}`);
            }

        } catch (e) {
            console.error(`Unexpected error for ${item.name}:`, e);
        }
    }
}

main();
