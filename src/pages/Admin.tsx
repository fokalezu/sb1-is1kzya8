import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Check, X, Edit, Trash2, Search, Crown, BadgeCheck, Clock, Camera, XCircle, Eye, EyeOff, Filter, Tag, Calendar, Plus, RefreshCw, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AdminMenu from '../components/Admin';

type PremiumPeriod = '1_month' | '3_months' | '6_months' | '12_months';

interface PricingTier {
  period: PremiumPeriod;
  price: number;
  savings?: number;
  isPopular?: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  city: string;
  user_type: 'standard' | 'verified' | 'premium';
  verification_status: boolean;
  is_blocked: boolean;
  is_hidden: boolean;
  premium_period: PremiumPeriod | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  created_at: string;
  verification_photo?: string;
  verification_submitted_at?: string;
}

type AccountFilter = 'all' | 'no_profile' | 'standard' | 'verified' | 'premium';

interface PromoCode {
  id: string;
  code: string;
  premium_period: PremiumPeriod;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  expires_at: string | null;
}

const premiumPeriods: PricingTier[] = [
  {
    period: '1_month',
    price: 30,
  },
  {
    period: '3_months',
    price: 75,
    savings: 15,
  },
  {
    period: '6_months',
    price: 120,
    savings: 60,
    isPopular: true,
  },
  {
    period: '12_months',
    price: 180,
    savings: 180,
  },
];

const getPeriodLabel = (period: PremiumPeriod): string => {
  switch (period) {
    case '1_month':
      return '1 Lună';
    case '3_months':
      return '3 Luni';
    case '6_months':
      return '6 Luni';
    case '12_months':
      return '12 Luni';
  }
};

const PhotoModal = ({ photoUrl, onClose }: { photoUrl: string; onClose: () => void }) => {
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
      <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative aspect-[4/3] w-full">
          <img
            src={photoUrl}
            alt="Fotografie verificare"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const PremiumModal = ({ 
  profile,
  isOpen,
  onClose,
  onActivate,
  onDeactivate
}: { 
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (period: PremiumPeriod) => void;
  onDeactivate: () => void;
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PremiumPeriod>('1_month');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {profile.user_type === 'premium' ? 'Gestionare Premium' : 'Activare Premium'}
        </h3>

        {profile.user_type === 'premium' ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status Premium Activ</p>
              <p className="font-medium">
                Expiră: {profile.premium_expires_at ? new Date(profile.premium_expires_at).toLocaleDateString() : 'Nedefinit'}
              </p>
            </div>
            <button
              onClick={onDeactivate}
              className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Dezactivează Premium
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Selectează Perioada
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PremiumPeriod)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {premiumPeriods.map((option) => (
                  <option key={option.period} value={option.period}>
                    {getPeriodLabel(option.period)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => onActivate(selectedPeriod)}
              className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Activează Premium
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Închide
        </button>
      </div>
    </div>
  );
};

const CreatePromoCodeModal = ({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    premium_period: PremiumPeriod;
    max_uses: number | null;
    expires_at: string | null;
  }) => void;
}) => {
  const [code, setCode] = useState('');
  const [premiumPeriod, setPremiumPeriod] = useState<PremiumPeriod>('1_month');
  const [maxUses, setMaxUses] = useState<string>('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Codul promoțional este obligatoriu');
      return;
    }

    // Validate max uses
    let parsedMaxUses: number | null = null;
    if (maxUses.trim()) {
      parsedMaxUses = parseInt(maxUses);
      if (isNaN(parsedMaxUses) || parsedMaxUses <= 0) {
        setError('Numărul maxim de utilizări trebuie să fie un număr pozitiv');
        return;
      }
    }

    // Validate expiration date
    let parsedExpirationDate: string | null = null;
    if (hasExpiration) {
      if (!expirationDate) {
        setError('Data de expirare este obligatorie');
        return;
      }
      parsedExpirationDate = new Date(expirationDate).toISOString();
    }

    onSave({
      code: code.trim(),
      premium_period: premiumPeriod,
      max_uses: parsedMaxUses,
      expires_at: parsedExpirationDate
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-purple-600" />
          Creare Cod Promoțional
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cod Promoțional
            </label>
            <div className="flex">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="ex: PREMIUM2025"
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perioada Premium
            </label>
            <select
              value={premiumPeriod}
              onChange={(e) => setPremiumPeriod(e.target.value as PremiumPeriod)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              {premiumPeriods.map((option) => (
                <option key={option.period} value={option.period}>
                  {getPeriodLabel(option.period)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Număr Maxim de Utilizări
            </label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Lasă gol pentru utilizări nelimitate"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasExpiration"
                checked={hasExpiration}
                onChange={(e) => setHasExpiration(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="hasExpiration" className="ml-2 block text-sm text-gray-700">
                Are dată de expirare
              </label>
            </div>
            
            {hasExpiration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Expirării
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Creează Cod
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'profiles' | 'verifications' | 'promo_codes' | 'statistics'>('profiles');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (!isAdmin) {
        navigate('/dashboard');
        return;
      }

      // Check if tab is specified in URL
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        switch (tabParam) {
          case 'profiles':
            setActiveTab('profiles');
            break;
          case 'verifications':
            setActiveTab('verifications');
            break;
          case 'promo_codes':
            setActiveTab('promo_codes');
            break;
          case 'statistics':
            setActiveTab('statistics');
            break;
          default:
            setActiveTab('profiles');
        }
      }

      fetchProfiles();
      fetchPromoCodes();
    };

    checkAccess();
  }, [user, isAdmin, navigate, searchParams]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profilesData) {
        setProfiles(profilesData);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('A apărut o eroare la încărcarea profilelor');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
    }
  };

  const handleUpdateUserType = async (profileId: string, newType: 'standard' | 'verified' | 'premium') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? { ...profile, user_type: newType } : profile
      ));
    } catch (err) {
      console.error('Error updating user type:', err);
      setError('A apărut o eroare la actualizarea tipului de utilizator');
    }
  };

  const handleToggleVerification = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: !currentStatus,
          user_type: !currentStatus ? 'verified' : 'standard'
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? { 
          ...profile, 
          verification_status: !currentStatus,
          user_type: !currentStatus ? 'verified' : 'standard'
        } : profile
      ));
    } catch (err) {
      console.error('Error toggling verification:', err);
      setError('A apărut o eroare la actualizarea statusului de verificare');
    }
  };

  const handleToggleBlock = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? { ...profile, is_blocked: !currentStatus } : profile
      ));
    } catch (err) {
      console.error('Error toggling block status:', err);
      setError('A apărut o eroare la actualizarea statusului de blocare');
    }
  };

  const handleToggleVisibility = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_hidden: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? { ...profile, is_hidden: !currentStatus } : profile
      ));
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('A apărut o eroare la actualizarea vizibilității profilului');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest profil?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.filter(profile => profile.id !== profileId));
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('A apărut o eroare la ștergerea profilului');
    }
  };

  const handleActivatePremium = async (profileId: string, period: PremiumPeriod) => {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'premium',
          premium_period: period,
          premium_started_at: now
        })
        .eq('id', profileId);

      if (error) throw error;

      // Fetch the updated profile to get the calculated premium_expires_at
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (fetchError) throw fetchError;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? updatedProfile : profile
      ));

      setIsPremiumModalOpen(false);
    } catch (err) {
      console.error('Error activating premium:', err);
      setError('A apărut o eroare la activarea premium');
    }
  };

  const handleDeactivatePremium = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'standard',
          premium_period: null,
          premium_started_at: null,
          premium_expires_at: null
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(profile =>
        profile.id === profileId ? {
          ...profile,
          user_type: 'standard',
          premium_period: null,
          premium_started_at: null,
          premium_expires_at: null
        } : profile
      ));

      setIsPremiumModalOpen(false);
    } catch (err) {
      console.error('Error deactivating premium:', err);
      setError('A apărut o eroare la dezactivarea premium');
    }
  };

  const handleCreatePromoCode = async (data: {
    code: string;
    premium_period: PremiumPeriod;
    max_uses: number | null;
    expires_at: string | null;
  }) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code: data.code,
          premium_period: data.premium_period,
          max_uses: data.max_uses,
          expires_at: data.expires_at,
          created_by: user?.id,
          is_active: true,
          current_uses: 0
        });

      if (error) throw error;

      // Refresh promo codes
      fetchPromoCodes();
      setIsPromoCodeModalOpen(false);
    } catch (err) {
      console.error('Error creating promo code:', err);
      setError('A apărut o eroare la crearea codului promoțional');
    }
  };

  const handleDeletePromoCode = async (codeId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest cod promoțional?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      setPromoCodes(promoCodes.filter(code => code.id !== codeId));
    } catch (err) {
      console.error('Error deleting promo code:', err);
      setError('A apărut o eroare la ștergerea codului promoțional');
    }
  };

  const handleTogglePromoCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      setPromoCodes(promoCodes.map(code =>
        code.id === codeId ? { ...code, is_active: !currentStatus } : code
      ));
    } catch (err) {
      console.error('Error toggling promo code status:', err);
      setError('A apărut o eroare la actualizarea statusului codului promoțional');
    }
  };

  const handleTabChange = (tab: 'profiles' | 'verifications' | 'promo_codes' | 'statistics') => {
    setActiveTab(tab);
    
    // Update URL with tab parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (profile.name?.toLowerCase().includes(searchLower)) ||
      (profile.email?.toLowerCase().includes(searchLower)) ||
      (profile.phone?.toLowerCase().includes(searchLower))
    );

    // Apply account type filter
    switch (accountFilter) {
      case 'no_profile':
        return matchesSearch && !profile.name;
      case 'standard':
        return matchesSearch && profile.user_type === 'standard';
      case 'verified':
        return matchesSearch && profile.verification_status;
      case 'premium':
        return matchesSearch && profile.user_type === 'premium';
      default:
        return matchesSearch;
    }
  });

  const pendingVerifications = profiles.filter(profile => 
    profile.verification_submitted_at && !profile.verification_status
  );

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4 mr-1" />
        Aprobată
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-4 h-4 mr-1" />
        În așteptare
      </span>
    );
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-purple-600" />
            Panou Administrare
          </h1>
          <p className="mt-2 text-gray-600">
            Gestionează utilizatorii și profilurile acestora
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Admin Menu */}
        <AdminMenu />

        <div className="mb-6 mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('profiles')}
                className={`${
                  activeTab === 'profiles'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <User className="h-5 w-5 inline-block mr-2" />
                Profile
              </button>
              <button
                onClick={() => handleTabChange('verifications')}
                className={`${
                  activeTab === 'verifications'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BadgeCheck className="h-5 w-5 inline-block mr-2" />
                Verificări în Așteptare
                {pendingVerifications.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {pendingVerifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('promo_codes')}
                className={`${
                  activeTab === 'promo_codes'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Tag className="h-5 w-5 inline-block mr-2" />
                Coduri Promoționale
              </button>
              <button
                onClick={() => handleTabChange('statistics')}
                className={`${
                  activeTab === 'statistics'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BarChart3 className="h-5 w-5 inline-block mr-2" />
                Statistici
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'profiles' && (
          <>
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Caută după nume, email sau telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Account Type Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAccountFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accountFilter === 'all'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Toate
                  </button>
                  <button
                    onClick={() => setAccountFilter('no_profile')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accountFilter === 'no_profile'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Fără Profil
                  </button>
                  <button
                    onClick={() => setAccountFilter('standard')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accountFilter === 'standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setAccountFilter('verified')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accountFilter === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BadgeCheck className="h-4 w-4 inline-block mr-1" />
                    Verificat
                  </button>
                  <button
                    onClick={() => setAccountFilter('premium')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accountFilter === 'premium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Crown className="h-4 w-4 inline-block mr-1" />
                    Premium
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilizator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tip Cont
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Înregistrării
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Se încarcă...
                        </td>
                      </tr>
                    ) : filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Nu s-au găsit profile
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <tr key={profile.id} className={profile.is_blocked ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {profile.name || 'Fără profil'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {profile.city && profile.county ? `${profile.city}, ${profile.county}` : 'Locație nespecificată'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{profile.email}</div>
                            <div className="text-sm text-gray-500">{profile.phone || 'Fără telefon'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={profile.user_type}
                              onChange={(e) => handleUpdateUserType(profile.id, e.target.value as 'standard' | 'verified' | 'premium')}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                            >
                              <option value="standard">Standard</option>
                              <option value="verified">Verificat</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleVerification(profile.id, profile.verification_status)}
                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                  profile.verification_status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <BadgeCheck className="h-4 w-4 mr-1" />
                                {profile.verification_status ? 'Verificat' : 'Neverificat'}
                              </button>

                              <button
                                onClick={() => handleToggleBlock(profile.id, profile.is_blocked)}
                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                  profile.is_blocked
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {profile.is_blocked ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </button>

                              <button
                                onClick={() => handleToggleVisibility(profile.id, profile.is_hidden)}
                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                  profile.is_hidden
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                                title={profile.is_hidden ? 'Profil ascuns' : 'Profil vizibil'}
                              >
                                {profile.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedProfile(profile);
                                setIsPremiumModalOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                              title={profile.user_type === 'premium' ? 'Gestionează Premium' : 'Activează Premium'}
                            >
                              <Crown className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/profile/${profile.id}`)}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'verifications' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilizator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fotografie Verificare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Cererii
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Se încarcă...
                      </td>
                    </tr>
                  ) : pendingVerifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Nu există cereri de verificare în așteptare
                      </td>
                    </tr>
                  ) : (
                    pendingVerifications.map((profile) => (
                      <tr key={profile.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {profile.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {profile.city}, {profile.county}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {profile.verification_photo ? (
                            <button
                              onClick={() => setSelectedPhoto(profile.verification_photo)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              <Camera className="h-4 w-4 mr-2 text-gray-500" />
                              Vezi Fotografia
                            </button>
                          ) : (
                            <span className="text-gray-500">Fără fotografie</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profile.verification_submitted_at && (
                            <>
                              <Clock className="h-4 w-4 inline-block mr-1 text-gray-400" />
                              {new Date(profile.verification_submitted_at).toLocaleDateString()}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleVerification(profile.id, false)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 mr-2"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprobă
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Respinge
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'promo_codes' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Coduri Promoționale</h2>
              <button
                onClick={() => setIsPromoCodeModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Creează Cod Nou
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cod
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Perioadă
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilizări
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiră
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Nu există coduri promoționale
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((code) => {
                        const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                        const isFullyUsed = code.max_uses && code.current_uses >= code.max_uses;
                        
                        return (
                          <tr key={code.id} className={isExpired || isFullyUsed ? 'bg-gray-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{code.code}</div>
                              <div className="text-xs text-gray-500">
                                Creat: {new Date(code.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Crown className="h-3 w-3 mr-1" />
                                {getPeriodLabel(code.premium_period)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {code.current_uses} / {code.max_uses || '∞'}
                              </div>
                              {isFullyUsed && (
                                <div className="text-xs text-red-500">Utilizat complet</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {code.expires_at ? (
                                <div className="text-sm text-gray-900">
                                  {new Date(code.expires_at).toLocaleDateString()}
                                  {isExpired && (
                                    <span className="ml-2 text-xs text-red-500">Expirat</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Fără expirare</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleTogglePromoCodeStatus(code.id, code.is_active)}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  code.is_active && !isExpired && !isFullyUsed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {code.is_active && !isExpired && !isFullyUsed ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Activ
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Inactiv
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeletePromoCode(code.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'statistics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistici Platformă</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Utilizatori</h3>
                <p className="text-3xl font-bold text-purple-600">{profiles.length}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Activi: </span>
                  {profiles.filter(p => !p.is_hidden && !p.is_blocked).length}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Utilizatori Verificați</h3>
                <p className="text-3xl font-bold text-green-600">
                  {profiles.filter(p => p.verification_status).length}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">În așteptare: </span>
                  {pendingVerifications.length}
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Utilizatori Premium</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {profiles.filter(p => p.user_type === 'premium').length}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Activi: </span>
                  {profiles.filter(p => 
                    p.user_type === 'premium' && 
                    p.premium_expires_at && 
                    new Date(p.premium_expires_at) > new Date()
                  ).length}
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coduri Promoționale</h3>
                <p className="text-3xl font-bold text-blue-600">{promoCodes.length}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Active: </span>
                  {promoCodes.filter(c => 
                    c.is_active && 
                    (!c.expires_at || new Date(c.expires_at) > new Date()) &&
                    (!c.max_uses || c.current_uses < c.max_uses)
                  ).length}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuție Geografică</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-center">
                  Pentru statistici mai detaliate, accesați pagina de Generator Sitemap pentru a genera rapoarte complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedPhoto && (
          <PhotoModal
            photoUrl={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}

        {selectedProfile && (
          <PremiumModal
            profile={selectedProfile}
            isOpen={isPremiumModalOpen}
            onClose={() => {
              setIsPremiumModalOpen(false);
              setSelectedProfile(null);
            }}
            onActivate={(period) => handleActivatePremium(selectedProfile.id, period)}
            onDeactivate={() => handleDeactivatePremium(selectedProfile.id)}
          />
        )}

        <CreatePromoCodeModal
          isOpen={isPromoCodeModalOpen}
          onClose={() => setIsPromoCodeModalOpen(false)}
          onSave={handleCreatePromoCode}
        />
      </div>
    </div>
  );
};

export default Admin;