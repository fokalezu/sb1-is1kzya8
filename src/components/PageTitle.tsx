import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SITE_NAME = 'Escortino.ro';

interface Profile {
  name: string;
}

const getPageTitle = (pathname: string, searchParams: URLSearchParams): string => {
  // Handle home page with county parameter
  if (pathname === '/') {
    const county = searchParams.get('county');
    if (county) {
      return `${SITE_NAME} - Escorte din ${county}, România`;
    }
    return `${SITE_NAME} - Escorte din România`;
  }

  // Handle other pages
  switch (pathname) {
    case '/login':
      return `${SITE_NAME} - Conectare`;
    case '/register':
      return `${SITE_NAME} - Înregistrare`;
    case '/dashboard':
      return `${SITE_NAME} - Panou de Control`;
    case '/profile':
      return `${SITE_NAME} - Editare Profil`;
    case '/photos':
      return `${SITE_NAME} - Administrare Fotografii`;
    case '/account-settings':
      return `${SITE_NAME} - Setări Cont`;
    case '/verify-profile':
      return `${SITE_NAME} - Verificare Profil`;
    case '/premium':
      return `${SITE_NAME} - Cont Premium`;
    case '/statistics':
      return `${SITE_NAME} - Statistici`;
    case '/admin':
      return `${SITE_NAME} - Administrare`;
    case '/contact':
      return `${SITE_NAME} - Contact`;
    case '/terms':
      return `${SITE_NAME} - Termeni și Condiții`;
    case '/privacy':
      return `${SITE_NAME} - Politica de Confidențialitate`;
    case '/cookies':
      return `${SITE_NAME} - Politica de Cookies`;
    case '/account-types':
      return `${SITE_NAME} - Tipuri de Conturi`;
    default:
      return SITE_NAME;
  }
};

const PageTitle = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      if (location.pathname.startsWith('/profile/') && params.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', params.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            document.title = SITE_NAME;
            return;
          }

          if (data) {
            document.title = `${SITE_NAME} - ${data.name}`;
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          document.title = SITE_NAME;
        }
      } else {
        // Set default title for non-profile pages
        document.title = getPageTitle(location.pathname, searchParams);
      }
    };

    fetchProfile();
  }, [location.pathname, params.id, searchParams]);

  return null;
};

export default PageTitle;