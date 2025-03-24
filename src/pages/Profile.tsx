import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, Lock, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { counties, citiesByCounty } from '../utils/romanianCities';

const schema = z.object({
  name: z.string().min(1, 'Numele este obligatoriu'),
  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'Trebuie să ai cel puțin 18 ani'),
  phone: z.string()
    .regex(/^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/, 'Număr de telefon invalid'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  city: z.string().min(1, 'Orașul este obligatoriu'),
  address: z.string().min(1, 'Adresa este obligatorie'),
  description: z.string().max(500, 'Descrierea nu poate depăși 500 de caractere').optional(),
  services: z.array(z.string()).min(1, 'Selectați cel puțin un serviciu'),
  showWhatsapp: z.boolean().optional(),
  showTelegram: z.boolean().optional(),
  incall_30min: z.number().transform(val => val || 0),
  incall_1h: z.number().transform(val => val || 0),
  incall_2h: z.number().transform(val => val || 0),
  incall_night: z.number().transform(val => val || 0),
  outcall_30min: z.number().transform(val => val || 0),
  outcall_1h: z.number().transform(val => val || 0),
  outcall_2h: z.number().transform(val => val || 0),
  outcall_night: z.number().transform(val => val || 0),
});

type FormData = z.infer<typeof schema>;

interface UserProfile {
  user_type: string;
  verification_status: boolean;
}

const services = [
  { id: 'sex_anal', label: 'Sex Anal' },
  { id: 'finalizare_orala', label: 'Finalizare Orală' },
  { id: 'finalizare_faciala', label: 'Finalizare Facială' },
  { id: 'finalizare_corporala', label: 'Finalizare Corporală' },
  { id: 'dildo_jucarii', label: 'Dildo Jucării Erotice' },
  { id: 'sarut', label: 'Sărut' },
  { id: 'gfe', label: 'Girlfriend Experience' },
  { id: 'oral_protejat', label: 'Oral Protejat' },
  { id: 'oral_neprotejat', label: 'Oral Neprotejat' },
  { id: 'sex_pozitii', label: 'Sex în Diferite Poziții' },
  { id: 'masaj_erotic', label: 'Masaj Erotic' },
  { id: 'body_masaj', label: 'Body Masaj' },
  { id: 'masaj_relaxare', label: 'Masaj de Relaxare' },
  { id: 'masaj_tantric', label: 'Masaj Tantric' },
  { id: 'masaj_intretinere', label: 'Masaj Întreținere' },
  { id: 'deepthroat', label: 'Deepthroat' },
  { id: 'sex_sani', label: 'Sex între Sâni' },
  { id: 'handjob', label: 'Handjob' },
  { id: 'threesome', label: 'Threesome' },
  { id: 'sex_grup', label: 'Sex în Grup' },
  { id: 'lesby_show', label: 'Lesby Show' },
  { id: 'squirt', label: 'Squirt' },
  { id: 'uro_activ', label: 'Uro Activ' },
  { id: 'dominare_soft', label: 'Dominare Soft' },
  { id: 'dominare_hard', label: 'Dominare Hard' },
  { id: 'footfetish', label: 'Footfetish' },
  { id: 'facesitting', label: 'Facesitting' }
];

const Profile = () => {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    user_type: 'standard',
    verification_status: false
  });
  const [descriptionLength, setDescriptionLength] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      incall_30min: 0,
      incall_1h: 0,
      incall_2h: 0,
      incall_night: 0,
      outcall_30min: 0,
      outcall_1h: 0,
      outcall_2h: 0,
      outcall_night: 0
    }
  });

  const watchBirthDate = watch('birthDate');
  const watchCounty = watch('county');
  const watchDescription = watch('description');

  const canManageContactPreferences = (userType: string, verificationStatus: boolean) => {
    return userType === 'premium' || verificationStatus;
  };

  useEffect(() => {
    if (watchBirthDate) {
      const birthDate = new Date(watchBirthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [watchBirthDate]);

  useEffect(() => {
    if (watchCounty !== selectedCounty) {
      setSelectedCounty(watchCounty);
      setValue('city', '');
    }
  }, [watchCounty, selectedCounty, setValue]);

  useEffect(() => {
    if (watchDescription) {
      setDescriptionLength(watchDescription.length);
    } else {
      setDescriptionLength(0);
    }
  }, [watchDescription]);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (data) {
            setUserProfile({
              user_type: data.user_type || 'standard',
              verification_status: data.verification_status || false
            });

            Object.entries(data).forEach(([key, value]) => {
              if (key in schema.shape) {
                if (key === 'birth_date_fixed') {
                  const date = new Date(value);
                  const formattedDate = date.toISOString().split('T')[0];
                  setValue('birthDate', formattedDate);
                } else if (key.startsWith('incall_') || key.startsWith('outcall_')) {
                  setValue(key as keyof FormData, value || 0);
                } else {
                  setValue(key as keyof FormData, value);
                }
              }
            });
            setSelectedCounty(data.county || '');
            
            // Set description length if description exists
            if (data.description) {
              setDescriptionLength(data.description.length);
            }
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Eroare la încărcarea profilului. Vă rugăm să încercați din nou.');
        }
      }
    };

    loadProfile();
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError('Trebuie să fii autentificat pentru a-ți crea profilul');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const pricingData = {
        incall_30min: data.incall_30min || 0,
        incall_1h: data.incall_1h || 0,
        incall_2h: data.incall_2h || 0,
        incall_night: data.incall_night || 0,
        outcall_30min: data.outcall_30min || 0,
        outcall_1h: data.outcall_1h || 0,
        outcall_2h: data.outcall_2h || 0,
        outcall_night: data.outcall_night || 0
      };

      const profileData = {
        user_id: user.id,
        name: data.name,
        birth_date_fixed: data.birthDate,
        phone: data.phone,
        county: data.county,
        city: data.city,
        address: data.address,
        description: data.description,
        services: data.services,
        showWhatsapp: data.showWhatsapp,
        showTelegram: data.showTelegram,
        ...pricingData,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existingProfile) {
        ({ error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id));
      } else {
        ({ error } = await supabase
          .from('profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
          }));
      }

      if (error) throw error;

      navigate('/photos');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('A apărut o eroare la salvarea profilului');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Completează Profilul</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume Complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    {...register('name')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nume și Prenume"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Nașterii
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    {...register('birthDate')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>
                {age !== null && (
                  <p className="mt-1 text-sm text-gray-600">Vârsta: {age} ani</p>
                )}
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Număr de Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  {...register('phone')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="+40 700 000 000"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere Profil
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  {...register('description')}
                  rows={4}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Scrie câteva cuvinte despre tine... (maxim 500 caractere)"
                  disabled={isLoading}
                  maxLength={500}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${descriptionLength > 450 ? (descriptionLength > 480 ? 'text-red-600' : 'text-yellow-600') : 'text-gray-500'}`}>
                  {descriptionLength}/500 caractere
                </span>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preferințe de Contact</h3>
                {!canManageContactPreferences(userProfile.user_type, userProfile.verification_status) && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Disponibil doar pentru utilizatori Premium sau Verificați
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <label className={`inline-flex items-center ${
                  !canManageContactPreferences(userProfile.user_type, userProfile.verification_status)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}>
                  <input
                    type="checkbox"
                    {...register('showWhatsapp')}
                    className="form-checkbox h-4 w-4 text-purple-600 disabled:opacity-50"
                    disabled={!canManageContactPreferences(userProfile.user_type, userProfile.verification_status) || isLoading}
                  />
                  <span className={`ml-2 ${
                    !canManageContactPreferences(userProfile.user_type, userProfile.verification_status)
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}>Afișează buton WhatsApp</span>
                </label>
                <label className={`inline-flex items-center ${
                  !canManageContactPreferences(userProfile.user_type, userProfile.verification_status)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}>
                  <input
                    type="checkbox"
                    {...register('showTelegram')}
                    className="form-checkbox h-4 w-4 text-purple-600 disabled:opacity-50"
                    disabled={!canManageContactPreferences(userProfile.user_type, userProfile.verification_status) || isLoading}
                  />
                  <span className={`ml-2 ${
                    !canManageContactPreferences(userProfile.user_type, userProfile.verification_status)
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}>Afișează buton Telegram</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Județ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    {...register('county')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                  >
                    <option value="">Selectează județul</option>
                    {counties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.county && (
                  <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oraș
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    {...register('city')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    disabled={!selectedCounty || isLoading}
                  >
                    <option value="">Selectează orașul</option>
                    {selectedCounty && citiesByCounty[selectedCounty]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresă
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  {...register('address')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Strada, Număr, Bloc, Scară, Apartament"
                  disabled={isLoading}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicii Oferite
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={service.id}
                      value={service.id}
                      {...register('services')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor={service.id} className="ml-2 block text-sm text-gray-900">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.services && (
                <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-3">Tarife Incall (La mine)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      30 minute
                    </label>
                    <input
                      type="number"
                      {...register('incall_30min', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      1 oră
                    </label>
                    <input
                      type="number"
                      {...register('incall_1h', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 ore
                    </label>
                    <input
                      type="number"
                      {...register('incall_2h', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Noapte
                    </label>
                    <input
                      type="number"
                      {...register('incall_night', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-3">Tarife Outcall (La tine)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      30 minute
                    </label>
                    <input
                      type="number"
                      {...register('outcall_30min', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      1 oră
                    </label>
                    <input
                      type="number"
                      {...register('outcall_1h', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2 ore
                    </label>
                    <input
                      type="number"
                      {...register('outcall_2h', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Noapte
                    </label>
                    <input
                      type="number"
                      {...register('outcall_night', { 
                        setValueAs: v => v === '' ? 0 : parseInt(v),
                        valueAsNumber: true 
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Se salvează...' : 'Salvează Profilul'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;