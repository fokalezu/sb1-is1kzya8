import React from 'react';
import { Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-purple-600 px-6 py-10 sm:px-10 sm:py-16">
            <div className="absolute top-4 left-4">
              <Link 
                to="/"
                className="inline-flex items-center text-white hover:text-purple-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Înapoi
              </Link>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <Cookie className="h-16 w-16 text-white mb-4" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
                Politica de Cookie-uri
              </h1>
              <p className="mt-4 text-purple-100 text-center max-w-2xl">
                Informații despre modul în care utilizăm cookie-urile pentru a vă îmbunătăți experiența.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/50 to-purple-800/50 backdrop-blur-sm"></div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-10">
            <div className="prose prose-purple max-w-none">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-8">
                <p className="text-purple-700">
                  Ultima actualizare: {new Date().toLocaleDateString()}
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                1. Ce sunt Cookie-urile?
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Cookie-urile sunt fișiere text mici care sunt stocate pe dispozitivul dvs. 
                  când vizitați site-ul nostru. Acestea ne ajută să vă oferim o experiență 
                  mai bună și mai personalizată.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                2. Tipuri de Cookie-uri pe care le Folosim
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie-uri Necesare</h3>
                <p className="text-gray-700 mb-4">
                  Acestea sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate. 
                  Includ cookie-uri pentru:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li>Autentificare și securitate</li>
                  <li>Preferințe de sesiune</li>
                  <li>Funcționalități de bază ale site-ului</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie-uri de Performanță</h3>
                <p className="text-gray-700 mb-4">
                  Ne ajută să înțelegem cum utilizați site-ul nostru și să îl îmbunătățim. 
                  Colectează informații despre:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li>Paginile vizitate</li>
                  <li>Timpul petrecut pe site</li>
                  <li>Erori întâlnite</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie-uri de Funcționalitate</h3>
                <p className="text-gray-700 mb-4">
                  Permit site-ului să rețină alegerile pe care le faceți pentru a vă oferi 
                  funcționalități îmbunătățite și personalizate:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Preferințe de limbă</li>
                  <li>Setări de notificări</li>
                  <li>Preferințe de afișare</li>
                </ul>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                3. Cum să Gestionați Cookie-urile
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  Puteți controla și/sau șterge cookie-urile după cum doriți. Puteți:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Șterge toate cookie-urile stocate pe computer</li>
                  <li>Seta browserul să blocheze cookie-urile</li>
                  <li>Configura setările pentru diferite tipuri de cookie-uri</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  Rețineți că blocarea tuturor cookie-urilor poate afecta funcționalitatea 
                  site-ului și experiența dvs. de utilizare.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                4. Contact
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Pentru întrebări despre utilizarea cookie-urilor pe site-ul nostru, 
                  vă rugăm să ne contactați prin intermediul paginii de contact.
                </p>
                <div className="mt-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Contactează-ne
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;