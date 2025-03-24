import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Tag, Shield, BarChart3 } from 'lucide-react';

const AdminMenu = () => {
  const menuItems = [
    {
      title: 'Gestionare Utilizatori',
      description: 'Administrează profilurile utilizatorilor',
      icon: Users,
      link: '/admin'
    },
    {
      title: 'Coduri Promoționale',
      description: 'Creează și gestionează coduri promoționale',
      icon: Tag,
      link: '/admin?tab=promo_codes'
    },
    {
      title: 'Verificări Profil',
      description: 'Aprobă sau respinge cereri de verificare',
      icon: Shield,
      link: '/admin?tab=verifications'
    },
    {
      title: 'Generator Sitemap',
      description: 'Generează fișiere sitemap.xml pentru SEO',
      icon: FileText,
      link: '/sitemap-generator'
    },
    {
      title: 'Statistici Platformă',
      description: 'Vizualizează statistici generale ale platformei',
      icon: BarChart3,
      link: '/admin?tab=statistics'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.link}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <item.icon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AdminMenu;