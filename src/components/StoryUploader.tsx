import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StoryUploaderProps {
  onUploadComplete: () => void;
}

const StoryUploader: React.FC<StoryUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Fișierul trebuie să fie o imagine sau un videoclip');
      return;
    }

    // Validate file size (max 350MB)
    if (file.size > 350 * 1024 * 1024) {
      setError('Fișierul trebuie să fie mai mic de 350MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.user_type !== 'premium') {
        throw new Error('Doar utilizatorii premium pot adăuga story-uri');
      }

      // Upload file to stories bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('stories')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          profile_id: profile.id,
          media_url: publicUrl,
          media_type: isImage ? 'image' : 'video',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });

      if (insertError) throw insertError;

      onUploadComplete();
    } catch (err) {
      console.error('Error uploading story:', err);
      setError(err instanceof Error ? err.message : 'A apărut o eroare la încărcarea story-ului');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        id="story-upload"
        disabled={isUploading}
      />
      <label
        htmlFor="story-upload"
        className="block w-16 h-16 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-purple-500 flex items-center justify-center transition-colors duration-200 hover:border-purple-600">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              ) : (
                <Plus className="h-6 w-6 text-purple-500" />
              )}
            </div>
          </div>
        </div>
      </label>

      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-fade-in">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryUploader;