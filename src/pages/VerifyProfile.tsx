import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, BadgeCheck, Camera, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Webcam from 'react-webcam';

interface Profile {
  verification_status: boolean;
  user_type: 'standard' | 'verified' | 'premium';
}

const VerifyProfile = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const webcamRef = React.useRef<Webcam>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: isMobile ? { exact: "user" } : "user"
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('verification_status, user_type')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('A apărut o eroare la încărcarea profilului');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const startCamera = () => {
    setIsCameraActive(true);
    setCapturedImage(null);
    setError(null);
  };

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const canvas = document.createElement('canvas');
      const video = webcamRef.current.video;
      
      if (!video) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Flip the image horizontally
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      // Draw the video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setIsCameraActive(true);
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  const submitVerification = async () => {
    if (!capturedImage || !user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert base64 image to blob
      const imageBlob = dataURLtoBlob(capturedImage);
      if (!imageBlob) {
        throw new Error('Error processing image');
      }

      // Create a File object from the blob
      const imageFile = new File([imageBlob], `verification_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Upload verification photo to Supabase Storage
      const fileName = `verification/${user.id}/${Date.now()}_verification.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded photo
      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(fileName);

      // Update profile verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: false, // În așteptare
          verification_photo: publicUrl,
          verification_submitted_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setVerificationSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('A apărut o eroare la trimiterea verificării. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Se încarcă...</div>
      </div>
    );
  }

  if (profile?.verification_status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BadgeCheck className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Profilul Tău Este Verificat!</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="mb-4">
                  Felicitări! Profilul tău a fost deja verificat și beneficiezi de toate avantajele unui cont verificat:
                </p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Badge-ul special de profil verificat
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Poziționare prioritară în rezultatele căutării
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Încărcare de până la 8 fotografii
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Credibilitate crescută în fața vizitatorilor
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Înapoi la Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <Shield className="mx-auto h-12 w-12 text-purple-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Verificare Profil</h2>
            <p className="mt-2 text-lg text-gray-600">
              Verifică-ți profilul pentru mai multă credibilitate și încredere
            </p>
          </div>

          {/* Benefits Section */}
          <div className="px-6 py-8 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">De ce să-ți verifici profilul?</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Credibilitate Crescută</h4>
                  <p className="mt-1 text-gray-600">Profilurile verificate primesc mai multă încredere din partea vizitatorilor.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Vizibilitate Mai Mare</h4>
                  <p className="mt-1 text-gray-600">Profilurile verificate apar primele în rezultatele căutării.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Mai Multe Fotografii</h4>
                  <p className="mt-1 text-gray-600">Poți încărca până la 8 fotografii și un clip video.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Badge Special</h4>
                  <p className="mt-1 text-gray-600">Primești un badge distinctiv care arată că profilul tău este verificat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Instructions */}
          <div className="px-6 py-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cum se face verificarea?</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm">
                  1
                </div>
                <p className="ml-3 text-gray-600">
                  Pregătește o coală de hârtie și un pix
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm">
                  2
                </div>
                <p className="ml-3 text-gray-600">
                  Scrie pe coală: numele site-ului și data de astăzi ({new Date().toLocaleDateString()})
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm">
                  3
                </div>
                <p className="ml-3 text-gray-600">
                  Fă-ți un selfie clar cu fața și textul vizibil folosind camera web sau telefonul
                </p>
              </div>
            </div>
          </div>

          {/* Camera Section */}
          <div className="px-6 py-8 border-t border-gray-200">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {verificationSubmitted ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">Verificare Trimisă cu Succes!</h3>
                <p className="mt-2 text-gray-600">
                  Cererea ta de verificare a fost trimisă. Vei primi un răspuns în curând.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {!isCameraActive && !capturedImage && (
                  <div className="text-center">
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Pornește Camera
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="space-y-4">
                    <div className="relative max-w-2xl mx-auto">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full rounded-lg"
                        mirrored={true}
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={capture}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Captureaza Imaginea
                      </button>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <div className="relative max-w-2xl mx-auto">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={retake}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Reîncearcă
                      </button>
                      <button
                        onClick={submitVerification}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Se trimite...' : 'Trimite pentru Verificare'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyProfile;