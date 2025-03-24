import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabasePromise } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of admin emails
const ADMIN_EMAILS = ['madalincraciunica@gmail.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for Supabase client to be fully initialized
        await supabasePromise;

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(session?.user ? ADMIN_EMAILS.includes(session.user.email || '') : false);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(session?.user ? ADMIN_EMAILS.includes(session.user.email || '') : false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to record login history
  const recordLoginHistory = async (userId: string, success: boolean = true) => {
    try {
      // Get IP address using a public API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;

      // Get user agent
      const userAgent = navigator.userAgent;

      // Insert login record
      await supabase.from('user_login_history').insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: success
      });
    } catch (error) {
      console.error('Error recording login history:', error);
      // Don't block the login process if recording fails
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    // Record successful signup
    if (data.user) {
      await recordLoginHistory(data.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Record failed login attempt if we can identify the user
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .single();
          
        if (userData?.user_id) {
          await recordLoginHistory(userData.user_id, false);
        }
        throw error;
      }
      
      // Record successful login
      if (data.user) {
        await recordLoginHistory(data.user.id);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}