/**
 * Photo Storage Service:
 * Handles photo uploads to Supabase Storage when configured,
 * or resilient browser/server data URL storage.
 */

export async function uploadPhoto(file: File, bucket: string = 'pet-photos'): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // 1. If Supabase Storage is configured in env
  if (supabaseUrl && supabaseKey) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          'Content-Type': file.type,
        },
        body: file,
      });

      if (res.ok) {
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local data URL:', err);
    }
  }

  // 2. Resilient base64 DataURL fallback for immediate local rendering and persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Échec de lecture du fichier'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de chargement'));
    reader.readAsDataURL(file);
  });
}
