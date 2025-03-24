import React from 'react';
import { BadgeCheck, Crown, User, Camera, MessageCircle, Clock, BarChart3, Video, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountTypes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Tipuri de Conturi</h1>
          <p className="text-xl text-purple-100">
            Alege contul potrivit pentru nevoile tale
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Standard Account */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-2 text-gray-600" />
                  Standard
                </h2>
                <span className="text-2xl font-bold text-gray-900">Gratuit</span>
              </div>
              <p className="text-gray-600 mb-6">
                Perfect pentru început
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Camera className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">4 Fotografii</p>
                    <p className="text-sm text-gray-600">Încarcă până la 4 fotografii pentru profilul tău</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-red-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Butoane Contact Dezactivate</p>
                    <p className="text-sm text-gray-600">WhatsApp și Telegram dezactivate</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-red-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Fără Story-uri</p>
                    <p className="text-sm text-gray-600">Nu poți adăuga story-uri temporare</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-red-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Fără Statistici</p>
                    <p className="text-sm text-gray-600">Nu ai acces la statistici și analize</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                Creează Cont Standard
              </Link>
            </div>
          </div>

          {/* Verified Account */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform lg:scale-105">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BadgeCheck className="h-6 w-6 mr-2 text-green-500" />
                  Verificat
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Recomandat
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Pentru credibilitate sporită
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Camera className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">8 Fotografii</p>
                    <p className="text-sm text-gray-600">Încarcă până la 8 fotografii pentru profilul tău</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Badge Verificat</p>
                    <p className="text-sm text-gray-600">Afișează badge-ul de profil verificat</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Butoane Contact</p>
                    <p className="text-sm text-gray-600">Activează butoanele WhatsApp și Telegram</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Statistici de Bază</p>
                    <p className="text-sm text-gray-600">Vezi câți vizitatori ai și interacțiunile lor</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/verify-profile"
                className="block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Verifică-ți Profilul
              </Link>
            </div>
          </div>

          {/* Premium Account */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                  Premium
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Toate Funcțiile
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Acces la toate funcționalitățile
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Camera className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">12 Fotografii</p>
                    <p className="text-sm text-gray-600">Încarcă până la 12 fotografii pentru profilul tău</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Video className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Videoclip de Prezentare</p>
                    <p className="text-sm text-gray-600">Adaugă un videoclip de până la 350MB</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Story-uri 24h</p>
                    <p className="text-sm text-gray-600">Adaugă story-uri care expiră după 24 de ore</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Reacții la Story-uri</p>
                    <p className="text-sm text-gray-600">Vezi cine reacționează la story-urile tale</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Statistici Avansate</p>
                    <p className="text-sm text-gray-600">Statistici detaliate și analytics complet</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Crown className="h-5 w-5 text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Poziționare Premium</p>
                    <p className="text-sm text-gray-600">Apari primă în rezultatele căutării</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/premium"
                className="block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
              >
                Devino Premium
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Întrebări Frecvente</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cum îmi verific profilul?
              </h3>
              <p className="text-gray-600">
                Pentru a-ți verifica profilul, accesează secțiunea "Verificare Profil" din dashboard și 
                urmează pașii pentru a face o poză cu tine ținând un bilețel cu numele site-ului și data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cât durează verificarea?
              </h3>
              <p className="text-gray-600">
                Verificarea profilului durează de obicei între 24-48 de ore. Vei primi o notificare 
                când profilul tău a fost verificat.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ce beneficii am cu un cont Premium?
              </h3>
              <p className="text-gray-600">
                Contul Premium îți oferă acces la toate funcționalitățile, inclusiv 12 fotografii, 
                videoclip de prezentare, story-uri, statistici avansate și poziționare prioritară în căutări.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pot trece de la Standard la Premium?
              </h3>
              <p className="text-gray-600">
                Da, poți face upgrade la contul tău oricând. Toate datele și setările tale vor fi păstrate 
                când faci upgrade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypes;