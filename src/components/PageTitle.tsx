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

const getPageDescription = (pathname: string, searchParams: URLSearchParams): string => {
  // Handle home page with county parameter
  if (pathname === '/') {
    const county = searchParams.get('county');
    if (county) {
      return `Descoperă cele mai frumoase escorte din ${county}. Profiluri verificate, fotografii reale și servicii de calitate pentru adulți.`;
    }
    return `Cel mai mare site de escorte din România. Profiluri verificate, fotografii reale și servicii de calitate pentru adulți.`;
  }

  // Handle other pages
  switch (pathname) {
    case '/login':
      return `Conectează-te la contul tău Escortino pentru a accesa toate funcționalitățile platformei și pentru a-ți gestiona profilul.`;
    case '/register':
      return `Creează un cont gratuit pe Escortino.ro și bucură-te de toate beneficiile platformei noastre pentru adulți.`;
    case '/dashboard':
      return `Administrează-ți contul, verifică statisticile și gestionează-ți profilul de pe platforma Escortino.`;
    case '/profile':
      return `Editează-ți profilul pentru a atrage mai mulți clienți. Adaugă informații despre serviciile tale și prețuri.`;
    case '/photos':
      return `Încarcă fotografii și videoclipuri pentru a-ți personaliza profilul și a atrage mai mulți vizitatori.`;
    case '/account-settings':
      return `Modifică setările contului tău, schimbă parola și actualizează informațiile de contact.`;
    case '/verify-profile':
      return `Verifică-ți profilul pentru a câștiga încrederea vizitatorilor și pentru a beneficia de avantaje exclusive.`;
    case '/premium':
      return `Descoperă beneficiile contului Premium: vizibilitate crescută, mai multe fotografii și funcționalități exclusive.`;
    case '/statistics':
      return `Analizează statisticile profilului tău, vezi câți vizitatori ai și optimizează-ți prezența online.`;
    case '/admin':
      return `Panou de administrare pentru gestionarea utilizatorilor, verificarea profilelor și administrarea platformei.`;
    case '/contact':
      return `Contactează echipa Escortino pentru asistență, întrebări sau sugestii legate de platforma noastră.`;
    case '/terms':
      return `Termenii și condițiile de utilizare a platformei Escortino.ro. Informații despre drepturile și obligațiile utilizatorilor.`;
    case '/privacy':
      return `Politica de confidențialitate Escortino.ro. Află cum colectăm, folosim și protejăm datele tale personale.`;
    case '/cookies':
      return `Politica de cookies Escortino.ro. Informații despre modul în care folosim cookie-urile pentru a îmbunătăți experiența ta.`;
    case '/account-types':
      return `Compară tipurile de conturi disponibile pe Escortino: Standard, Verificat și Premium. Alege opțiunea potrivită pentru tine.`;
    default:
      return `Escortino.ro - Cel mai mare site de escorte din România. Profiluri verificate, fotografii reale și servicii de calitate pentru adulți.`;
  }
};

const getPageKeywords = (pathname: string, searchParams: URLSearchParams): string => {
  // Handle home page with county parameter
  if (pathname === '/') {
    const county = searchParams.get('county');
    if (county) {
      return `escorte ${county}, dame de companie ${county}, servicii adulți ${county}, escorte verificate, escorte premium, escorte România`;
    }
    return `escorte, dame de companie, servicii adulți, escorte verificate, escorte premium, escorte România, anunțuri escorte`;
  }

  // Handle other pages
  switch (pathname) {
    case '/login':
      return `conectare escortino, login escorte, autentificare, cont escorte, acces cont`;
    case '/register':
      return `înregistrare escortino, creare cont escorte, cont nou, înregistrare gratuită, cont escorte`;
    case '/dashboard':
      return `panou control escorte, administrare cont, dashboard escortino, gestionare profil`;
    case '/profile':
      return `profil escorte, editare profil, informații escorte, servicii escorte, prețuri escorte`;
    case '/photos':
      return `fotografii escorte, poze escorte, galerie foto, încărcare poze, videoclipuri escorte`;
    case '/account-settings':
      return `setări cont, modificare parolă, actualizare email, setări profil, securitate cont`;
    case '/verify-profile':
      return `verificare profil, profil verificat, badge verificat, credibilitate escorte, siguranță`;
    case '/premium':
      return `cont premium, beneficii premium, escorte premium, vizibilitate crescută, funcții exclusive`;
    case '/statistics':
      return `statistici profil, analiză vizitatori, performanță profil, optimizare profil, trafic`;
    case '/admin':
      return `administrare escortino, panou admin, gestionare utilizatori, verificare profiluri`;
    case '/contact':
      return `contact escortino, asistență, suport, întrebări, reclamații, sugestii`;
    case '/terms':
      return `termeni și condiții, reguli utilizare, drepturi utilizatori, obligații utilizatori`;
    case '/privacy':
      return `politică confidențialitate, protecția datelor, GDPR, date personale, securitate date`;
    case '/cookies':
      return `politică cookies, cookie-uri, stocare date, preferințe utilizator, experiență site`;
    case '/account-types':
      return `tipuri conturi, cont standard, cont verificat, cont premium, comparație conturi, beneficii`;
    default:
      return `escorte, dame de companie, servicii adulți, escorte verificate, escorte premium, escorte România, anunțuri escorte`;
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
            .select('name, county, city') // presupun că ai câmpurile 'county' și 'city' în profil
            .eq('user_id', params.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            document.title = SITE_NAME;
            return;
          }

          if (data) {
            // Modifică titlul pentru pagina de profil cu județul și orașul
            document.title = `${SITE_NAME} - ${data.name} din ${data.county}, ${data.city}, România`;

            // Set meta description for profile page
            const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            metaDescription.setAttribute('content', `Profil ${data.name} pe Escortino.ro din ${data.county}, ${data.city}. Contactează acum pentru servicii de calitate și o experiență de neuitat.`);
            if (!document.querySelector('meta[name="description"]')) {
              document.head.appendChild(metaDescription);
            }

            // Set meta keywords for profile page
            const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            metaKeywords.setAttribute('content', `${data.name}, escorte, dame de companie, servicii adulți, ${data.county}, ${data.city}, escorte verificate, escorte premium`);
            if (!document.querySelector('meta[name="keywords"]')) {
              document.head.appendChild(metaKeywords);
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          document.title = SITE_NAME;
        }
      } else {
        // Set default title for non-profile pages
        document.title = getPageTitle(location.pathname, searchParams);
        
        // Set meta description for non-profile pages
        const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', getPageDescription(location.pathname, searchParams));
        if (!document.querySelector('meta[name="description"]')) {
          document.head.appendChild(metaDescription);
        }
        
        // Set meta keywords for non-profile pages
        const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        metaKeywords.setAttribute('content', getPageKeywords(location.pathname, searchParams));
        if (!document.querySelector('meta[name="keywords"]')) {
          document.head.appendChild(metaKeywords);
        }
      }
    };

    fetchProfile();
  }, [location.pathname, params.id, searchParams]);

  return null;
};

export default PageTitle;
