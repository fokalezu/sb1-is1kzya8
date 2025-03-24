import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
              <Shield className="h-16 w-16 text-white mb-4" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
                Termeni și Condiții
              </h1>
              <p className="mt-4 text-purple-100 text-center max-w-2xl">
                Vă rugăm să citiți cu atenție acești termeni și condiții înainte de a utiliza serviciile noastre.
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
                1. Acceptarea Termenilor
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Prin accesarea și utilizarea acestui site web, acceptați să respectați acești termeni și condiții de utilizare.
                  Dacă nu sunteți de acord cu oricare dintre acești termeni, vă rugăm să nu utilizați site-ul nostru.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                2. Eligibilitate
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Pentru a utiliza serviciile noastre, trebuie să aveți vârsta minimă de 18 ani. 
                  Prin crearea unui cont, confirmați că aveți cel puțin 18 ani și că sunteți capabil 
                  să încheiați un contract legal obligatoriu.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                3. Înregistrare și Cont
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  La înregistrare, trebuie să furnizați informații exacte și complete. 
                  Sunteți responsabil pentru menținerea confidențialității contului și parolei dvs. 
                  și pentru restricționarea accesului la computer.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                4. Conținut și Conduită
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Sunteți responsabil pentru tot conținutul pe care îl postați pe site. 
                  Conținutul trebuie să respecte legile aplicabile și să nu încalce drepturile terților.
                  Ne rezervăm dreptul de a șterge orice conținut care încalcă acești termeni.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                5. Servicii Premium
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Anumite funcționalități ale site-ului pot necesita un abonament premium. 
                  Tarifele și condițiile specifice vor fi prezentate clar înainte de achiziție.
                  Nu oferim rambursări pentru serviciile premium odată activate.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                6. Limitarea Răspunderii
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Site-ul este furnizat "ca atare" și nu oferim nicio garanție cu privire la 
                  disponibilitatea, acuratețea sau fiabilitatea sa. Nu suntem responsabili 
                  pentru niciun fel de daune directe sau indirecte rezultate din utilizarea site-ului.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                7. Modificări ale Termenilor
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Ne rezervăm dreptul de a modifica acești termeni în orice moment. 
                  Modificările vor intra în vigoare imediat după publicarea lor pe site. 
                  Continuarea utilizării site-ului după publicarea modificărilor constituie 
                  acceptarea noilor termeni.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                8. Reziliere
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Ne rezervăm dreptul de a suspenda sau închide contul dvs. în orice moment, 
                  pentru orice motiv, fără notificare prealabilă.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                9. Legea Aplicabilă
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Acești termeni sunt guvernați și interpretați în conformitate cu legile României. 
                  Orice dispută va fi supusă jurisdicției exclusive a instanțelor din România.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                10. Contact
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Pentru orice întrebări sau preocupări legate de acești termeni, 
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

export default Terms;