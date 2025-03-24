import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookiesAccepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4 flex-1">
          <div className="bg-purple-100 p-2 rounded-full">
            <Cookie className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-600">
              Acest site folosește cookie-uri pentru a vă îmbunătăți experiența. 
              Prin continuarea navigării, sunteți de acord cu 
              <Link to="/cookies" className="text-purple-600 hover:text-purple-700 mx-1">
                politica noastră de cookie-uri
              </Link>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;