import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const AgeVerification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const hasVerified = localStorage.getItem('ageVerified');
    if (!hasVerified) {
      setIsVisible(true);
      // Prevent scrolling when modal is shown
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVisible(false);
    // Restore scrolling when accepted
    document.body.style.overflow = 'auto';
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
      <div className="relative z-[101] bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Avertisment: Conținut pentru Adulți
          </h2>
          <div className="text-center text-gray-600 space-y-4">
            <p>
              Acest site conține conținut destinat exclusiv persoanelor cu vârsta de peste 18 ani.
            </p>
            <p>
              Prin accesarea site-ului, confirmați că aveți cel puțin 18 ani și sunteți de acord
              să vizualizați conținut destinat adulților.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-8 space-y-4">
            <button
              onClick={handleAccept}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Am peste 18 ani - Intră pe site
            </button>
            <button
              onClick={handleReject}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Am sub 18 ani - Părăsește site-ul
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Prin continuare, confirmați că accesarea acestui conținut este legală în zona dvs. geografică.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;