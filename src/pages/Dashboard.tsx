import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, Settings, CheckCircle, Crown, BarChart3, Camera, AlertTriangle, Power, Users, Copy, Check, Gift, Tag, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string | null;
  birth_date_fixed: string | null;
  phone: string | null;
  county: string | null;
  city: string | null;
  address: string | null;
  user_type: 'standard' | 'verified' | 'premium';
  verification_status: boolean;
  is_hidden: boolean;
  referral_code?: string;
  referral_count?: number;
  earned_premium_reward?: boolean;
  premium_expires_at?: string | null;
}

interface Referral {
  id: string;
  referred_user: {
    name: string;
    user_type: string;
    created_at: string;
  };
}

const DeactivateAccountModal = ({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText.toLowerCase() === 'dezactiveaza';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4 text-red-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h3 className="text-xl font-bold">Dezactivare Cont</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Ești sigur că vrei să îți dezactivezi contul? Această acțiune va:
          </p>
          
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Ascunde profilul tău din toate căutările</li>
            <li>Păstrează datele tale pentru reactivare ulterioară</li>
            <li>Suspendă toate funcționalitățile contului</li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Pentru confirmare, te rugăm să scrii "dezactiveaza":
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="dezactiveaza"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={onConfirm}
              disabled={!isConfirmEnabled}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dezactivează Contul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ icon: Icon, title, description, to, disabled = false, className = '', variant = 'default' }: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'verified' | 'premium';
}) => {
  const baseClasses = "bg-white p-6 rounded-lg shadow-md transition-all duration-200";
  const enabledClasses = "hover:shadow-lg cursor-pointer";
  const disabledClasses = "opacity-50 cursor-not-allowed";
  
  const variantClasses = {
    default: "",
    verified: "bg-green-50 border-2 border-green-500",
    premium: "bg-yellow-50 border-2 border-yellow-500"
  };

  return (
    <Link
      to={disabled ? '#' : to}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${variantClasses[variant]} ${className}`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${
          variant === 'verified' ? 'bg-green-100' : 
          variant === 'premium' ? 'bg-yellow-100' : 
          'bg-purple-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            variant === 'verified' ? 'text-green-600' : 
            variant === 'premium' ? 'text-yellow-600' : 
            'text-purple-600'
          }`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

const PremiumRewardModal = ({ isOpen, onClose, onClaim }: {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-10 w-10 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Felicitări!</h3>
          <p className="text-lg text-gray-700 mb-6">
            Ai obținut o lună de Premium gratuit pentru recomandările tale!
          </p>
          <p className="text-gray-600 mb-8">
            Mulțumim pentru că ai recomandat Escortino prietenilor tăi. Contul tău a fost actualizat automat la Premium pentru o lună.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClaim}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              <Crown className="h-5 w-5 inline-block mr-2" />
              Bucură-te de Premium!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoCodeModal = ({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    period: string;
    expiresAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setError('Te rugăm să introduci un cod promoțional');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call the redeem_promo_code function
      const { data, error } = await supabase.rpc('redeem_promo_code', {
        p_code: promoCode.trim()
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        // Format the premium period for display
        let periodDisplay = '';
        switch (data.premium_period) {
          case '1_month': periodDisplay = '1 lună'; break;
          case '3_months': periodDisplay = '3 luni'; break;
          case '6_months': periodDisplay = '6 luni'; break;
          case '12_months': periodDisplay = '12 luni'; break;
          default: periodDisplay = data.premium_period;
        }
        
        // Format the expiration date
        const expiresAt = new Date(data.expires_at).toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setSuccess({
          message: data.message,
          period: periodDisplay,
          expiresAt: expiresAt
        });
        
        // Close the modal after 3 seconds on success
        setTimeout(() => {
          onClose(true);
        }, 3000);
      } else {
        setError(data?.message || 'A apărut o eroare la activarea codului promoțional');
      }
    } catch (err) {
      console.error('Error redeeming promo code:', err);
      setError('A apărut o eroare la activarea codului promoțional');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Activează Cod Promoțional</h3>
          <p className="mt-2 text-gray-600">
            Introdu codul promoțional pentru a activa beneficiile Premium
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">{success.message}</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Ai activat Premium pentru <span className="font-semibold">{success.period}</span>
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <Clock className="h-4 w-4 inline-block mr-1" />
                Expiră pe {success.expiresAt}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-1">
                Cod Promoțional
              </label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Introdu codul promoțional"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Se procesează...' : 'Activează'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ReferralSection = ({ referralCode, referrals, referralCount, earnedReward, onRewardClaimed }: { 
  referralCode: string; 
  referrals: Referral[];
  referralCount: number;
  earnedReward: boolean;
  onRewardClaimed: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(earnedReward);

  const copyToClipboard = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate progress to next reward
  const progressToNextReward = referralCount % 10;
  const progressPercentage = (progressToNextReward / 10) * 100;
  const nextRewardAt = Math.ceil(referralCount / 10) * 10;
  const remainingForReward = nextRewardAt - referralCount;

  const handleClaimReward = () => {
    setShowRewardModal(false);
    onRewardClaimed();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-600" />
          Sistem de Recomandare
        </h2>
        
        <div className="space-y-6">
          <div>
            <p className="text-gray-600 mb-3">
              Recomandă Escortino prietenilor tăi și ajută-i să se alăture comunității noastre.
              <span className="font-medium text-purple-600"> La fiecare 10 recomandări primești o lună de cont Premium gratuit!</span>
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link-ul tău de recomandare:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={`${window.location.origin}/register?ref=${referralCode}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiat
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiază
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress to next reward */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-purple-700">Progres spre următoarea recompensă</span>
              <span className="text-sm font-medium text-purple-700">{progressToNextReward}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-purple-600">
              {remainingForReward > 0 ? (
                <span>Încă {remainingForReward} recomandări pentru o lună de Premium gratuit!</span>
              ) : (
                <span className="flex items-center font-medium">
                  <Gift className="h-4 w-4 mr-1 text-yellow-500" />
                  Felicitări! Ai obținut o lună de Premium gratuit!
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Recomandări</p>
                <p className="text-xl font-bold text-gray-900">{referralCount}</p>
              </div>
            </div>
            
            {referrals.length > 0 && (
              <button
                onClick={() => setShowReferrals(!showReferrals)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                {showReferrals ? 'Ascunde Lista' : 'Vezi Lista'}
              </button>
            )}
          </div>
          
          {showReferrals && referrals.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Utilizatori Recomandați</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nume
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tip Cont
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Înregistrării
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {referral.referred_user.name || 'Utilizator Nou'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {referral.referred_user.user_type === 'premium' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </span>
                          ) : referral.referred_user.user_type === 'verified' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificat
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.referred_user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Reward Modal */}
      <PremiumRewardModal 
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onClaim={handleClaimReward}
      />
    </>
  );
};

const PromoCodeSection = ({ isPremium, premiumExpiresAt, onPromoCodeSuccess }: {
  isPremium: boolean;
  premiumExpiresAt: string | null;
  onPromoCodeSuccess: () => void;
}) => {
  const [showPromoModal, setShowPromoModal] = useState(false);

  const handlePromoCodeClose = (success?: boolean) => {
    setShowPromoModal(false);
    if (success) {
      onPromoCodeSuccess();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Tag className="h-5 w-5 mr-2 text-purple-600" />
        Cod Promoțional
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Ai un cod promoțional? Activează-l pentru a beneficia de avantajele contului Premium.
        </p>
        
        {isPremium && premiumExpiresAt && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Crown className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <p className="font-medium text-gray-800">Cont Premium Activ</p>
                <p className="text-sm text-gray-600">
                  Contul tău Premium expiră pe {new Date(premiumExpiresAt).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowPromoModal(true)}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Tag className="h-4 w-4 mr-2" />
          Activează Cod Promoțional
        </button>
      </div>

      {/* Promo Code Modal */}
      <PromoCodeModal 
        isOpen={showPromoModal}
        onClose={handlePromoCodeClose}
      />
    </div>
  );
};

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [earnedReward, setEarnedReward] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, birth_date_fixed, phone, county, city, address, user_type, verification_status, is_hidden, referral_code, referral_count, earned_premium_reward, premium_expires_at')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            setProfile(data);
            setEarnedReward(data.earned_premium_reward || false);
          }

          const isComplete = data && 
            data.name && 
            data.birth_date_fixed && 
            data.phone && 
            data.county && 
            data.city && 
            data.address;

          setIsProfileComplete(!!isComplete);

          // Set referral code or generate one if it doesn't exist
          if (data.referral_code) {
            setReferralCode(data.referral_code);
          } else {
            const newReferralCode = generateReferralCode();
            await updateReferralCode(newReferralCode);
            setReferralCode(newReferralCode);
          }

          setReferralCount(data.referral_count || 0);

          // Fetch referrals
          fetchReferrals();
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const generateReferralCode = () => {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const updateReferralCode = async (code: string) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ referral_code: code })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error updating referral code:', err);
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      // First get the profiles that were referred by this user
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('id, referred_user_id')
        .eq('referrer_user_id', user.id);

      if (referralError) throw referralError;

      if (referralData && referralData.length > 0) {
        // Get profile information for each referred user
        const referredUserIds = referralData.map(r => r.referred_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, user_type, created_at')
          .in('user_id', referredUserIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const combinedData = referralData.map(referral => {
          const profile = profilesData?.find(p => p.user_id === referral.referred_user_id);
          return {
            id: referral.id,
            referred_user: {
              name: profile?.name || 'Utilizator Nou',
              user_type: profile?.user_type || 'standard',
              created_at: profile?.created_at || new Date().toISOString()
            }
          };
        });

        setReferrals(combinedData);
      } else {
        setReferrals([]);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  };

  const handleRewardClaimed = async () => {
    if (!profile) return;
    
    try {
      // Update the earned_premium_reward flag to false
      await supabase
        .from('profiles')
        .update({ earned_premium_reward: false })
        .eq('id', profile.id);
      
      setEarnedReward(false);
    } catch (err) {
      console.error('Error updating reward status:', err);
    }
  };

  const handlePromoCodeSuccess = async () => {
    // Refresh profile data to get updated premium status
    if (user) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, user_type, premium_expires_at')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          setProfile(prev => prev ? { ...prev, ...data } : data);
        }
      } catch (err) {
        console.error('Error refreshing profile after promo code:', err);
      }
    }
  };

  const handleDeactivateAccount = async () => {
    if (!user) return;

    try {
      setIsProcessing(true);

      // Update profile to be hidden
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_hidden: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      // Sign out user
      await signOut();
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error deactivating account:', err);
      alert('A apărut o eroare la dezactivarea contului. Te rugăm să încerci din nou.');
    } finally {
      setIsProcessing(false);
      setIsDeactivateModalOpen(false);
    }
  };

  const handleActivateAccount = async () => {
    if (!user) return;

    try {
      setIsProcessing(true);

      // Update profile to be visible
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_hidden: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('name, birth_date_fixed, phone, county, city, address, user_type, verification_status, is_hidden')
        .eq('user_id', user.id)
        .single();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

    } catch (err) {
      console.error('Error activating account:', err);
      alert('A apărut o eroare la activarea contului. Te rugăm să încerci din nou.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!isProfileComplete && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">
              Pentru a putea încărca fotografii și a beneficia de toate funcționalitățile, 
              te rugăm să completezi mai întâi profilul tău cu informațiile necesare.
            </p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Panoul de Control</h1>
          <p className="mt-2 text-gray-600">Gestionează-ți profilul și setările contului tău</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <DashboardCard
            icon={UserCircle}
            title={isProfileComplete ? "Editează Profilul" : "Completează Profilul"}
            description={isProfileComplete 
              ? "Actualizează informațiile profilului tău" 
              : "Completează informațiile de bază pentru a-ți activa profilul"}
            to="/profile"
            className={!isProfileComplete ? "ring-2 ring-purple-500 bg-purple-50" : ""}
          />

          <DashboardCard
            icon={Camera}
            title="Fotografii și Video"
            description={isProfileComplete 
              ? "Gestionează fotografiile și videoclipurile profilului tău"
              : "Completează profilul pentru a putea încărca fotografii și video"}
            to="/photos"
            disabled={!isProfileComplete}
            className={!isProfileComplete ? "bg-gray-50" : ""}
          />

          <DashboardCard
            icon={Settings}
            title="Setări Cont"
            description="Gestionează emailul și parola contului tău"
            to="/account-settings"
          />

          <DashboardCard
            icon={CheckCircle}
            title="Verificare Profil"
            description="Verifică-ți profilul pentru mai multă credibilitate"
            to="/verify-profile"
            variant={profile?.verification_status ? 'verified' : 'default'}
          />

          <DashboardCard
            icon={Crown}
            title="Premium"
            description="Upgrade la contul premium pentru beneficii exclusive"
            to="/premium"
            variant={profile?.user_type === 'premium' ? 'premium' : 'default'}
          />

          <DashboardCard
            icon={BarChart3}
            title="Statistici"
            description="Vezi statisticile profilului tău și interacțiunile vizitatorilor"
            to="/statistics"
          />
        </div>

        {/* Promo Code Section */}
        <PromoCodeSection 
          isPremium={profile?.user_type === 'premium'}
          premiumExpiresAt={profile?.premium_expires_at || null}
          onPromoCodeSuccess={handlePromoCodeSuccess}
        />

        {/* Referral System Section */}
        {referralCode && (
          <ReferralSection 
            referralCode={referralCode} 
            referrals={referrals}
            referralCount={referralCount}
            earnedReward={earnedReward}
            onRewardClaimed={handleRewardClaimed}
          />
        )}

        {/* Account Status Section */}
        <div className="mt-12 border-t pt-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {profile?.is_hidden ? 'Cont Dezactivat' : 'Dezactivare Cont'}
            </h2>
            <p className="text-gray-600 mb-6">
              {profile?.is_hidden 
                ? 'Contul tău este momentan dezactivat. Profilul tău nu este vizibil pentru vizitatori.'
                : 'Dorești să iei o pauză? Poți să îți dezactivezi temporar contul. Profilul tău va fi ascuns, dar vei putea să îl reactivezi oricând.'}
            </p>
            {profile?.is_hidden ? (
              <button
                onClick={handleActivateAccount}
                className="inline-flex items-center px-4 py-2 border border-green-300 text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isProcessing}
              >
                <Power className="h-5 w-5 mr-2" />
                {isProcessing ? 'Se activează...' : 'Activează Contul'}
              </button>
            ) : (
              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isProcessing}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                {isProcessing ? 'Se dezactivează...' : 'Dezactivează Contul'}
              </button>
            )}
          </div>
        </div>

        {/* Deactivate Account Modal */}
        <DeactivateAccountModal
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          onConfirm={handleDeactivateAccount}
        />
      </div>
    </div>
  );
};

export default Dashboard;