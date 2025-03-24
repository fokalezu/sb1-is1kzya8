import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type PremiumPeriod = '1_month' | '3_months' | '6_months' | '12_months';

interface PricingTier {
  period: PremiumPeriod;
  price: number;
  savings?: number;
  isPopular?: boolean;
}

interface UserProfile {
  name: string;
  user_type: string;
  premium_period: PremiumPeriod | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
}

const pricingTiers: PricingTier[] = [
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

const Premium = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PremiumPeriod>('6_months');
  const [profileName, setProfileName] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, user_type, premium_period, premium_started_at, premium_expires_at')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUserProfile(data);
          setProfileName(data.name);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  const handleWhatsAppContact = () => {
    const selectedTier = pricingTiers.find(tier => tier.period === selectedPeriod);
    const message = encodeURIComponent(
      `Numele meu este ${profileName} si doresc achizitionarea pachetului de ${getPeriodLabel(selectedPeriod)} Premium in valoare de ${selectedTier?.price} RON, Contul meu este urmatorul: ${user?.email}`
    );
    window.open(`https://wa.me/40784911500?text=${message}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show premium status if user is already premium
  if (userProfile?.user_type === 'premium' && userProfile.premium_expires_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-8 text-center border-b border-gray-200">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Cont Premium Activ</h2>
              <p className="mt-4 text-lg text-gray-600">
                Mulțumim că ai ales să fii membru premium! Apreciem încrederea ta și suntem bucuroși să îți oferim cele mai bune funcționalități.
              </p>
            </div>

            <div className="px-6 py-8 bg-gradient-to-br from-yellow-50 to-purple-50">
              <div className="max-w-xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalii Abonament</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tip Abonament:</span>
                        <span className="font-medium text-gray-900">
                          {userProfile.premium_period ? getPeriodLabel(userProfile.premium_period) : 'Premium'}
                        </span>
                      </div>
                      {userProfile.premium_started_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Data Activării:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(userProfile.premium_started_at)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Data Expirării:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(userProfile.premium_expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficii Active</h3>
                    <div className="grid gap-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Încărcare până la 12 fotografii</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Videoclip de prezentare (până la 350MB)</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Story-uri cu durata de 24 ore</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Poziționare prioritară în căutări</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Badge premium distinctiv</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-gray-600">Statistici avansate și analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <Crown className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Cont Premium</h2>
            <p className="mt-2 text-lg text-gray-600">
              Deblochează toate funcționalitățile și maximizează-ți vizibilitatea
            </p>
          </div>

          {/* Benefits Section */}
          <div className="px-6 py-8 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Beneficii Premium</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">12 Fotografii</h4>
                  <p className="mt-1 text-gray-600">Încarcă până la 12 fotografii pentru a-ți prezenta profilul în detaliu.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Videoclip de Prezentare</h4>
                  <p className="mt-1 text-gray-600">Adaugă un videoclip de prezentare de până la 350MB.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Story-uri 24h</h4>
                  <p className="mt-1 text-gray-600">Adaugă story-uri care rămân vizibile timp de 24 de ore și vezi cine le vizualizează.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Poziție Top</h4>
                  <p className="mt-1 text-gray-600">Profilul tău va apărea întotdeauna în primele poziții ale căutărilor.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Badge Premium</h4>
                  <p className="mt-1 text-gray-600">Un badge distinctiv care arată că ești un membru premium.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Statistici Avansate</h4>
                  <p className="mt-1 text-gray-600">Vezi cine ți-a vizitat profilul, story-urile și alte statistici detaliate.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="px-6 py-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Alege Perioada</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.period}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                    selectedPeriod === tier.period
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                  onClick={() => setSelectedPeriod(tier.period)}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {getPeriodLabel(tier.period)}
                    </h4>
                    <div className="mt-2 text-3xl font-bold text-purple-600">
                      {tier.price} RON
                    </div>
                    {tier.savings && (
                      <div className="mt-1 text-sm text-green-600">
                        Economisești {tier.savings} RON
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      {(tier.price / (parseInt(tier.period) || 1)).toFixed(2)} RON/lună
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Contact Button */}
            <div className="max-w-md mx-auto">
              <button
                onClick={handleWhatsAppContact}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-150"
              >
                <MessageCircle className="h-6 w-6 mr-2" />
                Contactează-ne pe WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;