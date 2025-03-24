import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateSitemap, generateCountySitemaps, generateSitemapIndex } from '../utils/sitemapGenerator';

const SitemapGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mainSitemap, setMainSitemap] = useState<string | null>(null);
  const [countySitemaps, setCountySitemaps] = useState<Map<string, string>>(new Map());
  const [sitemapIndex, setSitemapIndex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user || !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleGenerateSitemaps = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);
      
      // Base URL for the site
      const baseUrl = 'https://escortino.ro';
      
      // Generate main sitemap
      const sitemap = await generateSitemap(baseUrl);
      setMainSitemap(sitemap);
      
      // Generate county sitemaps
      const countySitemapsResult = await generateCountySitemaps(baseUrl);
      setCountySitemaps(countySitemapsResult);
      
      // Generate sitemap index
      const counties = Array.from(countySitemapsResult.keys());
      const index = generateSitemapIndex(baseUrl, counties);
      setSitemapIndex(index);
      
      setSuccess('Sitemap-urile au fost generate cu succes!');
    } catch (err) {
      console.error('Error generating sitemaps:', err);
      setError('A apărut o eroare la generarea sitemap-urilor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSitemap = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generator Sitemap</h1>
          <p className="mt-2 text-gray-600">
            Generează fișiere sitemap.xml pentru îmbunătățirea indexării în motoarele de căutare
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Generare Sitemap</h2>
            <button
              onClick={handleGenerateSitemaps}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Se generează...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Generează Sitemap-uri
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* Main Sitemap */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Sitemap Principal</h3>
                {mainSitemap && (
                  <button
                    onClick={() => downloadSitemap(mainSitemap, 'sitemap.xml')}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descarcă
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Conține toate paginile statice și profilurile active.
              </p>
              {mainSitemap && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">
                    {mainSitemap.length} caractere • {mainSitemap.split('\n').length} linii
                  </p>
                </div>
              )}
            </div>

            {/* County Sitemaps */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Sitemap-uri pe Județe</h3>
                <span className="text-sm text-gray-500">
                  {countySitemaps.size} județe
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sitemap-uri separate pentru fiecare județ cu profiluri active.
              </p>
              
              {countySitemaps.size > 0 && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Județ
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mărime
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(countySitemaps.entries()).map(([county, content]) => (
                        <tr key={county}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {county}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {content.length} caractere
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => downloadSitemap(content, `sitemap-${county.toLowerCase()}.xml`)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sitemap Index */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Index Sitemap</h3>
                {sitemapIndex && (
                  <button
                    onClick={() => downloadSitemap(sitemapIndex, 'sitemap-index.xml')}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descarcă
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Index care conține referințe către toate sitemap-urile.
              </p>
              {sitemapIndex && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">
                    {sitemapIndex.length} caractere • {sitemapIndex.split('\n').length} linii
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instrucțiuni de Implementare</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            <ol className="space-y-4">
              <li>
                <strong>Descarcă fișierele generate</strong> folosind butoanele de mai sus.
              </li>
              <li>
                <strong>Încarcă fișierul sitemap.xml</strong> în directorul rădăcină al site-ului.
              </li>
              <li>
                <strong>Creează un director /sitemaps/</strong> în rădăcina site-ului.
              </li>
              <li>
                <strong>Încarcă sitemap-urile pe județe</strong> în directorul /sitemaps/.
              </li>
              <li>
                <strong>Încarcă sitemap-index.xml</strong> în directorul rădăcină al site-ului.
              </li>
              <li>
                <strong>Verifică robots.txt</strong> pentru a te asigura că există linia:
                <pre className="bg-gray-100 p-2 rounded-md mt-1">Sitemap: https://escortino.ro/sitemap-index.xml</pre>
              </li>
              <li>
                <strong>Trimite sitemap-urile către Google Search Console</strong> pentru indexare rapidă.
              </li>
            </ol>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <p className="font-medium">Notă importantă:</p>
              <p>Regenerează sitemap-urile periodic (săptămânal sau lunar) pentru a menține informațiile actualizate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;