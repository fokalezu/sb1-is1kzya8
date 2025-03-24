import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ArrowLeft, Info, Crown, BadgeCheck, Video, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  user_type: 'standard' | 'verified' | 'premium';
  media: {
    photos: string[];
    video?: string;
  };
}

const PhotoUpload = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getMaxPhotos = (userType: string) => {
    switch (userType) {
      case 'premium':
        return 12;
      case 'verified':
        return 8;
      default:
        return 4;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, media')
            .eq('user_id', user.id)
            .single();

          if (profileError) throw profileError;

          if (data) {
            setUserProfile(data as UserProfile);
            if (data.media?.photos) {
              setUploadedPhotos(data.media.photos);
            }
            if (data.media?.video) {
              setUploadedVideo(data.media.video);
            }
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Eroare la încărcarea profilului');
        }
      }
    };

    loadProfile();
  }, [user]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile) return;

    const files = Array.from(event.target.files || []);
    const maxPhotos = getMaxPhotos(userProfile.user_type);
    
    if (files.length + uploadedPhotos.length > maxPhotos) {
      setError(`Puteți avea maximum ${maxPhotos} fotografii în total`);
      return;
    }
    
    setPhotos(files);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile || userProfile.user_type !== 'premium') return;

    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (350MB in bytes)
    const maxSize = 350 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Videoclipul trebuie să fie mai mic de 350MB');
      return;
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format video invalid. Sunt acceptate doar MP4, WebM și OGG.');
      return;
    }

    setVideo(file);
    setError(null);
  };

  const addWatermark = (url: string): string => {
    return `${url}?watermark=Escortino.ro`;
  };

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(fileName, photo);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      uploadedUrls.push(addWatermark(publicUrl));
    }

    return uploadedUrls;
  };

  const uploadVideo = async (userId: string): Promise<string | null> => {
    if (!video) return null;

    const fileExt = video.name.split('.').pop();
    const fileName = `${userId}/video_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, video);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user || !userProfile) {
      setError('Trebuie să fii autentificat pentru a încărca fișiere');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let photoUrls: string[] = [...uploadedPhotos];
      let videoUrl: string | null = uploadedVideo;

      if (photos.length > 0) {
        const newPhotoUrls = await uploadPhotos(user.id);
        photoUrls = [...photoUrls, ...newPhotoUrls];
      }

      if (video && userProfile.user_type === 'premium') {
        videoUrl = await uploadVideo(user.id);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          media: {
            photos: photoUrls,
            video: videoUrl
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('A apărut o eroare la salvarea fișierelor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setUploadedVideo(null);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Se încarcă...</div>
      </div>
    );
  }

  const maxPhotos = getMaxPhotos(userProfile.user_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Înapoi la Dashboard
              </button>
              <div className="flex items-center space-x-2">
                {userProfile.user_type === 'premium' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown className="h-4 w-4 mr-1" />
                    Premium
                  </span>
                )}
                {userProfile.user_type === 'verified' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Verificat
                  </span>
                )}
                <h2 className="text-xl font-semibold text-gray-900">Încărcare Media</h2>
              </div>
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="bg-purple-50 p-4 border-b border-purple-100">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-purple-800">Reguli pentru încărcare:</h3>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  <li>• Puteți încărca maximum {maxPhotos} fotografii</li>
                  {userProfile.user_type === 'premium' && (
                    <li>• Puteți încărca un videoclip de maximum 350MB</li>
                  )}
                  <li>• Formate acceptate pentru poze: PNG, JPG, GIF</li>
                  <li>• Formate acceptate pentru video: MP4, WebM, OGG</li>
                  <li>• Dimensiune maximă per fotografie: 10MB</li>
                  <li>• Toate fișierele vor fi marcate automat cu watermark Escortino.ro</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Existing Photos */}
            {uploadedPhotos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Fotografii Existente ({uploadedPhotos.length}/{maxPhotos})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="relative">
                        <img
                          src={photo}
                          alt={`Fotografie ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                          Escortino.ro
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Photos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adaugă Fotografii Noi {uploadedPhotos.length > 0 && `(${maxPhotos - uploadedPhotos.length} locuri disponibile)`}
              </h3>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="photos"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Încarcă fotografii</span>
                      <input
                        id="photos"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isLoading || uploadedPhotos.length >= maxPhotos}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF până la 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Photos Preview */}
            {photos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fotografii Selectate</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from(photos).map((photo, index) => (
                    <div key={index} className="relative">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Previzualizare ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                          Escortino.ro
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Upload for Premium Users */}
            {userProfile.user_type === 'premium' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Videoclip
                </h3>
                
                {uploadedVideo ? (
                  <div className="relative">
                    <video
                      src={uploadedVideo}
                      controls
                      className="w-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="video"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                        >
                          <span>Încarcă videoclip</span>
                          <input
                            id="video"
                            type="file"
                            className="sr-only"
                            accept="video/mp4,video/webm,video/ogg"
                            onChange={handleVideoUpload}
                            disabled={isLoading}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        MP4, WebM, OGG până la 350MB
                      </p>
                    </div>
                  </div>
                )}

                {video && !uploadedVideo && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Videoclip Selectat</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Video className="h-4 w-4" />
                      <span>{video.name}</span>
                      <span>({Math.round(video.size / (1024 * 1024))}MB)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || (photos.length === 0 && uploadedPhotos.length === 0 && !video && !uploadedVideo)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;