import React, { useState, useEffect } from 'react';
import { BadgeCheck, Crown, Filter, UserPlus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import StoriesBar from '../components/StoriesBar';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  phone: string;
  city: string;
  county: string;
  user_type: 'standard' | 'verified' | 'premium';
  verification_status: boolean;
  is_hidden: boolean;
  media: {
    photos: string[];
  };
}

const Home = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCounty = searchParams.get('county');
  const selectedType = searchParams.get('type');
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Number of profiles per page based on screen size
  const profilesPerPage = isMobile ? 6 : 15;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('profiles')
          .select('*')
          .not('name', 'is', null)
          .not('county', 'is', null)
          .not('city', 'is', null)
          .eq('is_hidden', false);

        // Apply county filter if selected
        if (selectedCounty) {
          query = query.eq('county', selectedCounty);
        }

        // Apply type filter if selected
        if (selectedType) {
          switch (selectedType) {
            case 'premium':
              query = query.eq('user_type', 'premium');
              break;
            case 'verified':
              query = query.eq('verification_status', true);
              break;
          }
        }

        const { data: profilesData, error: profilesError } = await query;

        if (profilesError) {
          throw profilesError;
        }

        if (profilesData) {
          // Sort and randomize profiles
          const sortedProfiles = sortAndRandomizeProfiles(profilesData as Profile[]);
          setProfiles(sortedProfiles);
          // Reset to first page when filters change
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('A apărut o eroare la încărcarea profilelor. Te rugăm să reîncerci.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [selectedCounty, selectedType]);

  // Function to sort and randomize profiles
  const sortAndRandomizeProfiles = (profilesData: Profile[]) => {
    // Separate profiles by type
    const premiumProfiles = profilesData.filter(p => p.user_type === 'premium');
    const verifiedProfiles = profilesData.filter(p => p.verification_status && p.user_type !== 'premium');
    const standardProfiles = profilesData.filter(p => !p.verification_status && p.user_type === 'standard');

    // Randomize each group
    const randomize = (arr: Profile[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Combine the randomized groups in priority order
    return [
      ...randomize(premiumProfiles),
      ...randomize(verifiedProfiles),
      ...randomize(standardProfiles)
    ];
  };

  // Calculate pagination
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = profiles.slice(indexOfFirstProfile, indexOfLastProfile);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to top of profiles grid
    const profilesGrid = document.getElementById('profiles-grid');
    if (profilesGrid) {
      profilesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTypeFilter = (type: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (type) {
      newParams.set('type', type);
    } else {
      newParams.delete('type');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Se încarcă profilele...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Stories Bar with adjusted padding on mobile */}
      <div className="pt-5 md:pt-0">
        <StoriesBar isPremium={userProfile?.user_type === 'premium'} />
      </div>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-12">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Încearcă din nou
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Filter Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtrează după tip</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleTypeFilter(null)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedType
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toate
                </button>
                <button
                  onClick={() => handleTypeFilter('verified')}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'verified'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Verificate
                </button>
                <button
                  onClick={() => handleTypeFilter('premium')}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'premium'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Premium
                </button>
              </div>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nu există încă profile active în această zonă.
                </p>
              </div>
            ) : (
              <>
                {/* Profiles Grid */}
                <div id="profiles-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {currentProfiles.map(profile => (
                    <Link
                      key={profile.id}
                      to={`/profile/${profile.id}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[3/4]">
                        <img
                          src={profile.media?.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Status Badges - Moved to bottom left */}
                        <div className="absolute bottom-2 left-2 flex flex-col space-y-1">
                          {profile.user_type === 'premium' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white shadow-sm">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </span>
                          )}
                          {profile.verification_status && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              Verificat
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm truncate">{profile.name}</h3>
                        <p className="text-gray-600 text-xs truncate">
                          {profile.city}, {profile.county}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Add Profile Button - Only show when not authenticated */}
                {!user && (
                  <div className="mt-8 text-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
                    >
                      <div className="relative">
                        <UserPlus className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                        <Heart className="absolute -top-1 -right-1 h-4 w-4 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      Adaugă un Profil
                      <div className="ml-2 flex space-x-1">
                        <Heart className="h-4 w-4 text-pink-300 animate-pulse" />
                        <Heart className="h-4 w-4 text-pink-300 animate-pulse delay-100" />
                        <Heart className="h-4 w-4 text-pink-300 animate-pulse delay-200" />
                      </div>
                    </Link>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    {/* Previous Page Button */}
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          currentPage === number
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    {/* Next Page Button */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;