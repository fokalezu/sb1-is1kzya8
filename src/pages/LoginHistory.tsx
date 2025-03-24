import React, { useState, useEffect } from 'react';
import { Activity, Globe, Calendar, Check, X, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoginRecord {
  id: string;
  ip_address: string;
  user_agent: string;
  login_at: string;
  country: string | null;
  city: string | null;
  success: boolean;
}

const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('user_login_history')
          .select('*')
          .eq('user_id', user.id)
          .order('login_at', { ascending: false });

        if (error) throw error;
        setLoginHistory(data || []);
      } catch (err) {
        console.error('Error fetching login history:', err);
        setError('A apărut o eroare la încărcarea istoricului de conectare');
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, [user]);

  const filteredHistory = loginHistory.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'success') return record.success;
    if (filter === 'failed') return !record.success;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-purple-600" />
            Istoricul Conectărilor
          </h1>
          <p className="mt-2 text-gray-600">
            Vizualizează istoricul conectărilor tale și dispozitivele folosite
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toate
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Check className="h-4 w-4 inline-block mr-1" />
                Reușite
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="h-4 w-4 inline-block mr-1" />
                Eșuate
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresă IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locație
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Browser / Dispozitiv
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Conectării
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Se încarcă istoricul de conectare...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nu există înregistrări de conectare
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((login) => (
                    <tr key={login.id} className={login.success ? '' : 'bg-red-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{login.ip_address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {login.city && login.country 
                            ? `${login.city}, ${login.country}`
                            : login.country || 'Locație necunoscută'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={login.user_agent}>
                          {login.user_agent || 'Necunoscut'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Calendar className="h-4 w-4 inline-block mr-1 text-gray-400" />
                        {new Date(login.login_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          login.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {login.success 
                            ? <Check className="h-3 w-3 mr-1" /> 
                            : <X className="h-3 w-3 mr-1" />}
                          {login.success ? 'Succes' : 'Eșuat'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informații despre Securitate</h2>
          <p className="text-gray-600 mb-4">
            Monitorizarea istoricului de conectare este o măsură importantă de securitate. Verifică periodic această pagină pentru a te asigura că nu există activități suspecte pe contul tău.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Dacă observi conectări pe care nu le recunoști, îți recomandăm să îți schimbi imediat parola și să contactezi echipa de suport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;