import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, User, LogOut, Shield, MapPin, ChevronDown, Search, LayoutDashboard, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  phone: string;
  city: string;
  county: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [isCountyMenuOpen, setIsCountyMenuOpen] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [activeCounties, setActiveCounties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setUserName(data.name);
          setUserProfileId(data.id);
        } else {
          setUserName(user.email?.split('@')[0] || 'Utilizator');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserName(user.email?.split('@')[0] || 'Utilizator');
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchActiveCounties = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('county')
          .not('county', 'is', null)
          .not('name', 'is', null)
          .not('city', 'is', null);

        if (error) {
          console.error('Supabase error fetching counties:', error);
          return;
        }

        if (data) {
          const counties = [...new Set(data.map(profile => profile.county))].sort();
          setActiveCounties(counties);
        }
      } catch (err) {
        console.error('Error fetching active counties:', err);
      }
    };

    fetchActiveCounties();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      
      const userMenuContainer = document.getElementById('user-menu-container');
      if (userMenuContainer && !userMenuContainer.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, city, county')
        .not('name', 'is', null)  // Ensure name is not null
        .not('phone', 'is', null) // Ensure phone is not null
        .not('city', 'is', null)  // Ensure city is not null
        .not('county', 'is', null) // Ensure county is not null
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,city.ilike.%${query}%,county.ilike.%${query}%`)
        .eq('is_hidden', false)
        .limit(5);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching profiles:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setIsCountyMenuOpen(false);
    navigate(`/?county=${encodeURIComponent(county)}`);
  };

  const handleViewProfile = () => {
    if (userProfileId) {
      navigate(`/profile/${userProfileId}`);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section: Logo and Navigation */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center text-purple-600 font-bold text-xl gap-2 mr-8"
              >
                <img 
                  src="https://api.escortino.ro/storage/v1/object/public/profiles/logo/escortino-logo.png" 
                  alt="Escortino"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Center Section: Search */}
            <div className="flex-1 max-w-2xl px-4 hidden lg:block">
              <div id="search-container" className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Caută după nume, telefon sau locație..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        Se caută...
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            to={`/profile/${result.id}`}
                            className="block px-4 py-2 hover:bg-gray-50"
                            onClick={() => setShowSearchResults(false)}
                          >
                            <div className="font-medium text-gray-900">{result.name}</div>
                            <div className="text-sm text-gray-500">
                              {result.city}, {result.county}
                              {result.phone && ` • ${result.phone}`}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: County Selector and User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* County Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsCountyMenuOpen(!isCountyMenuOpen)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedCounty || 'Selectează Județul'}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                {isCountyMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1 max-h-96 overflow-y-auto" role="menu">
                      {activeCounties.map((county) => (
                        <button
                          key={county}
                          onClick={() => handleCountySelect(county)}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            selectedCounty === county
                              ? 'bg-purple-100 text-purple-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          role="menuitem"
                        >
                          {county}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Auth Buttons / User Menu */}
              {!user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Conectare
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Înregistrare
                  </Link>
                </div>
              ) : (
                <div id="user-menu-container" className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>{userName}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 inline mr-2" />
                        Profilul Meu
                      </button>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LayoutDashboard className="h-4 w-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/login-history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Activity className="h-4 w-4 inline mr-2" />
                        Istoric Conectări
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Shield className="h-4 w-4 inline mr-2" />
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Deconectare
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          {/* Search Bar - Mobile */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Caută după nume, telefon sau locație..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && (searchResults.length > 0 || isSearching) && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    Se caută...
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        to={`/profile/${result.id}`}
                        className="block px-4 py-2 hover:bg-gray-50"
                        onClick={() => {
                          setShowSearchResults(false);
                          setIsOpen(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.city}, {result.county}
                          {result.phone && ` • ${result.phone}`}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 pb-3 space-y-1">
            {!user ? (
              <div className="px-4 py-2 space-y-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Conectare
                </Link>
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Înregistrare
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/dashboard')
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 inline mr-2" />
                  Administrare Cont
                </Link>
                <Link
                  to="/login-history"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/login-history')
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Activity className="h-5 w-5 inline mr-2" />
                  Istoric Conectări
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin')
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5 inline mr-2" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleViewProfile();
                    setIsOpen(false);
                  }}
                  className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  <User className="h-5 w-5 inline mr-2" />
                  {userName}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-5 w-5 inline mr-2" />
                  Deconectare
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile County Selector - Move inside main nav */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white shadow-md">
        <div className="p-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCounty || ''}
              onChange={(e) => handleCountySelect(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">Selectează Județul</option>
              {activeCounties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;