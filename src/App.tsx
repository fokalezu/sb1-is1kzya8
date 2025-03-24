import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PhotoUpload from './pages/PhotoUpload';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import VerifyProfile from './pages/VerifyProfile';
import Premium from './pages/Premium';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import Home from './pages/Home';
import ViewProfile from './pages/ViewProfile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Contact from './pages/Contact';
import AccountTypes from './pages/AccountTypes';
import LoginHistory from './pages/LoginHistory';
import SitemapGenerator from './pages/SitemapGenerator';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import AgeVerification from './components/AgeVerification';
import PageTitle from './components/PageTitle';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { setupErrorHandling } from './utils/errorHandler';

// Loading component for the app
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-[100]">
    <div className="text-xl text-gray-600 animate-pulse">Se încarcă...</div>
  </div>
);

// Main app component with loading state
const AppContent = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    // Setup error handling to hide file paths
    setupErrorHandling();
    
    // Disable right-click to prevent viewing source
    document.addEventListener('contextmenu', (e) => {
      // Allow right-click on form elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    });
    
    // Disable keyboard shortcuts for viewing source
    document.addEventListener('keydown', (e) => {
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+J (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      return true;
    });
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        {/* Main content with flex-grow to push footer down */}
        <div className="flex-grow">
          {/* Adjust padding for mobile and desktop */}
          <div className="pt-[104px] md:pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:id" element={<ViewProfile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/account-types" element={<AccountTypes />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/photos" element={<PhotoUpload />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                <Route path="/verify-profile" element={<VerifyProfile />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login-history" element={<LoginHistory />} />
                <Route path="/sitemap-generator" element={<SitemapGenerator />} />
              </Route>
            </Routes>
          </div>
        </div>
        {/* Footer will always be at the bottom */}
        <Footer />
        <CookieConsent />
        <AgeVerification />
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageTitle />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;