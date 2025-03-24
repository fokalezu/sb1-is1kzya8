import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
              <Lock className="h-16 w-16 text-white mb-4" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
                Politica de Confidențialitate
              </h1>
              <p className="mt-4 text-purple-100 text-center max-w-2xl">
                Protejarea datelor dvs. personale este o prioritate pentru noi.
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
                1. Introducere
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Protejarea confidențialității dvs. este o prioritate pentru noi. 
                  Această politică de confidențialitate explică modul în care colectăm, 
                  utilizăm și protejăm informațiile dvs. personale.
                </p>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                2. Informații pe care le Colectăm
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700 mb-4">Colectăm următoarele tipuri de informații:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Informații de identificare (nume, email, număr de telefon)</li>
                  <li>Date demografice (vârstă, locație)</li>
                  <li>Fotografii și conținut media încărcat de dvs.</li>
                  <li>Informații despre utilizarea site-ului</li>
                  <li>Date tehnice (adresă IP, tip browser)</li>
                </ul>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                3. Cum Utilizăm Informațiile
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700 mb-4">Utilizăm informațiile dvs. pentru:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Furnizarea serviciilor noastre</li>
                  <li>Îmbunătățirea experienței utilizatorului</li>
                  <li>Comunicări despre servicii și actualizări</li>
                  <li>Prevenirea fraudelor și abuzurilor</li>
                  <li>Respectarea obligațiilor legale</li>
                </ul>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                4. Drepturile Dvs.
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700 mb-4">Aveți următoarele drepturi:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Dreptul de acces la datele dvs.</li>
                  <li>Dreptul la rectificarea datelor</li>
                  <li>Dreptul la ștergerea datelor</li>
                  <li>Dreptul la restricționarea prelucrării</li>
                  <li>Dreptul la portabilitatea datelor</li>
                  <li>Dreptul de a vă opune prelucrării</li>
                </ul>
              </div>

              <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                5. Contact
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                  Pentru orice întrebări sau preocupări legate de confidențialitatea datelor dvs., 
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

export default Privacy;