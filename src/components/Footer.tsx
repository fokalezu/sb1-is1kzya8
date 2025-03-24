import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Shield, Lock, Cookie, BadgeCheck, MessageCircle } from 'lucide-react';

const Footer = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '40784911500';
    const message = encodeURIComponent('Buna ziua, am o problema ma puteti ajuta ?');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Despre Noi
            </h3>
            <p className="text-gray-400">
              Platforma noastră oferă un spațiu sigur și discret pentru 
              persoanele care caută companie de calitate. Toate profilele 
              sunt verificate pentru a asigura siguranța utilizatorilor.
            </p>
          </div>

          {/* Account Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BadgeCheck className="h-5 w-5 mr-2" />
              Tipuri de Conturi
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/account-types" className="hover:text-white transition-colors">
                  Comparație Conturi
                </Link>
              </li>
              <li>
                <Link to="/verify-profile" className="hover:text-white transition-colors">
                  Verificare Profil
                </Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-white transition-colors">
                  Beneficii Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Politica de Confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors flex items-center">
                  <Cookie className="h-4 w-4 mr-2" />
                  Politica de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contactează-ne
                </Link>
              </li>
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="text-white bg-green-600 hover:bg-green-700 transition-colors rounded-md px-4 py-2 flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Asistență WhatsApp
                </button>
              </li>
              <li className="text-gray-400">
                Email: support@escortino.ro
              </li>
              <li className="text-gray-400">
                Program: Luni - Vineri, 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Escortino.ro. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;