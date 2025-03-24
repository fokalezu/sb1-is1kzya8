import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Send, MapPin, Calendar, Check, BadgeCheck, Crown, Play, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  birth_date_fixed: string;
  phone: string;
  county: string;
  city: string;
  address: string;
  description: string;
  services: string[];
  user_type: 'standard' | 'verified' | 'premium';
  verification_status: boolean;
  showWhatsapp: boolean;
  showTelegram: boolean;
  media: {
    photos: string[];
    video?: string;
  };
  incall_30min: number;
  incall_1h: number;
  incall_2h: number;
  incall_night: number;
  outcall_30min: number;
  outcall_1h: number;
  outcall_2h: number;
  outcall_night: number;
}

// Map service IDs to human-readable labels
const serviceLabels: Record<string, string> = {
  'sex_anal': 'Sex Anal',
  'finalizare_orala': 'Finalizare Orală',
  'finalizare_faciala': 'Finalizare Facială',
  'finalizare_corporala': 'Finalizare Corporală',
  'dildo_jucarii': 'Dildo Jucării Erotice',
  'sarut': 'Sărut',
  'gfe': 'Girlfriend Experience',
  'oral_protejat': 'Oral Protejat',
  'oral_neprotejat': 'Oral Neprotejat',
  'sex_pozitii': 'Sex în Diferite Poziții',
  'masaj_erotic': 'Masaj Erotic',
  'body_masaj': 'Body Masaj',
  'masaj_relaxare': 'Masaj de Relaxare',
  'masaj_tantric': 'Masaj Tantric',
  'masaj_intretinere': 'Masaj Întreținere',
  'deepthroat': 'Deepthroat',
  'sex_sani': 'Sex între Sâni',
  'handjob': 'Handjob',
  'threesome': 'Threesome',
  'sex_grup': 'Sex în Grup',
  'lesby_show': 'Lesby Show',
  'squirt': 'Squirt',
  'uro_activ': 'Uro Activ',
  'dominare_soft': 'Dominare Soft',
  'dominare_hard': 'Dominare Hard',
  'footfetish': 'Footfetish',
  'facesitting': 'Facesitting'
};

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full bg-black rounded-lg shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative aspect-video w-full">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const ViewProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data as Profile);
          
          // Record view if not the profile owner
          if (user?.id !== data.user_id) {
            await recordProfileView(data.id);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('A apărut o eroare la încărcarea profilului');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const recordProfileView = async (profileId: string) => {
    try {
      await supabase
        .from('profile_stats')
        .insert({
          profile_id: profileId,
          event_type: 'view'
        });
    } catch (err) {
      console.error('Error recording profile view:', err);
    }
  };

  const handlePhoneClick = async () => {
    if (!profile) return;

    try {
      // Record phone click
      await supabase
        .from('profile_stats')
        .insert({
          profile_id: profile.id,
          event_type: 'phone_click'
        });

      // Open phone dialer
      window.location.href = `tel:${profile.phone}`;
    } catch (err) {
      console.error('Error recording phone click:', err);
    }
  };

  const handleWhatsAppClick = async () => {
    if (!profile || !profile.showWhatsapp) return;

    try {
      // Record WhatsApp click
      await supabase
        .from('profile_stats')
        .insert({
          profile_id: profile.id,
          event_type: 'whatsapp_click'
        });

      // Open WhatsApp
      const phoneNumber = profile.phone.replace(/\s+/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    } catch (err) {
      console.error('Error recording WhatsApp click:', err);
    }
  };

  const handleTelegramClick = async () => {
    if (!profile || !profile.showTelegram) return;

    try {
      // Record Telegram click
      await supabase
        .from('profile_stats')
        .insert({
          profile_id: profile.id,
          event_type: 'telegram_click'
        });

      // Open Telegram
      const phoneNumber = profile.phone.replace(/\s+/g, '');
      window.open(`https://t.me/${phoneNumber}`, '_blank');
    } catch (err) {
      console.error('Error recording Telegram click:', err);
    }
  };

  const nextPhoto = () => {
    if (!profile?.media.photos) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % profile.media.photos.length);
  };

  const prevPhoto = () => {
    if (!profile?.media.photos) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + profile.media.photos.length) % profile.media.photos.length);
  };

  const canShowContactButtons = (profile: Profile) => {
    return profile.verification_status || profile.user_type === 'premium';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Se încarcă profilul...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Profilul nu a fost găsit'}</div>
      </div>
    );
  }

  // Check if profile has any pricing information
  const hasIncallPrices = (profile.incall_30min || 0) > 0 || 
                          (profile.incall_1h || 0) > 0 || 
                          (profile.incall_2h || 0) > 0 || 
                          (profile.incall_night || 0) > 0;
                          
  const hasOutcallPrices = (profile.outcall_30min || 0) > 0 || 
                           (profile.outcall_1h || 0) > 0 || 
                           (profile.outcall_2h || 0) > 0 || 
                           (profile.outcall_night || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Photo Gallery */}
            <div className="md:w-1/2 relative">
              <div className="relative aspect-[3/4] bg-gray-200">
                {profile.media.photos && profile.media.photos.length > 0 ? (
                  <>
                    <img
                      src={profile.media.photos[currentPhotoIndex]}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {profile.media.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        >
                          &#10094;
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        >
                          &#10095;
                        </button>
                      </>
                    )}

                    {/* Photo Counter */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentPhotoIndex + 1} / {profile.media.photos.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Fără fotografii</p>
                  </div>
                )}

                {/* Video Play Button - Only show for premium */}
                {profile.media.video && profile.user_type === 'premium' && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-opacity"
                  >
                    <Play className="h-6 w-6" />
                  </button>
                )}

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {profile.verification_status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <BadgeCheck className="h-4 w-4 mr-1" />
                      Verificat
                    </span>
                  )}
                  {profile.user_type === 'premium' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Crown className="h-4 w-4 mr-1" />
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:w-1/2 p-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <div className="mt-2 flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-1" />
                    {profile.city}, {profile.county}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                    <p className="mt-1 text-lg text-gray-900">{profile.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vârstă</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date().getFullYear() - new Date(profile.birth_date_fixed).getFullYear()} ani
                    </p>
                  </div>
                </div>

                {/* Description */}
                {profile.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Despre mine</h3>
                    <p className="text-gray-700">{profile.description}</p>
                  </div>
                )}

                {/* Contact Buttons - Updated to be in a row */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePhoneClick}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Sună Acum
                  </button>
                  
                  <button
                    onClick={handleWhatsAppClick}
                    disabled={!profile?.showWhatsapp || !canShowContactButtons(profile)}
                    className={`flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      profile?.showWhatsapp && canShowContactButtons(profile)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </button>

                  <button
                    onClick={handleTelegramClick}
                    disabled={!profile?.showTelegram || !canShowContactButtons(profile)}
                    className={`flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      profile?.showTelegram && canShowContactButtons(profile)
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Telegram
                  </button>
                </div>

                {/* Services */}
                {profile.services && profile.services.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Servicii Oferite</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {profile.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-gray-700"
                        >
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{serviceLabels[service] || service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="space-y-4">
                  {/* Incall Pricing */}
                  {hasIncallPrices && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tarife Incall (La mine)</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(profile.incall_30min || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">30 min</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.incall_30min} RON</p>
                          </div>
                        )}
                        {(profile.incall_1h || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">1 oră</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.incall_1h} RON</p>
                          </div>
                        )}
                        {(profile.incall_2h || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">2 ore</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.incall_2h} RON</p>
                          </div>
                        )}
                        {(profile.incall_night || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Noapte</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.incall_night} RON</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Outcall Pricing */}
                  {hasOutcallPrices && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tarife Outcall (La tine)</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(profile.outcall_30min || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">30 min</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.outcall_30min} RON</p>
                          </div>
                        )}
                        {(profile.outcall_1h || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">1 oră</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.outcall_1h} RON</p>
                          </div>
                        )}
                        {(profile.outcall_2h || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">2 ore</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.outcall_2h} RON</p>
                          </div>
                        )}
                        {(profile.outcall_night || 0) > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Noapte</p>
                            <p className="text-lg font-semibold text-gray-900">{profile.outcall_night} RON</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Only show for premium */}
      {showVideo && profile.media.video && profile.user_type === 'premium' && (
        <VideoModal
          videoUrl={profile.media.video}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default ViewProfile;