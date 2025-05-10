'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

// Define the shape of the profile data we expect
interface Profile {
  id: string;
  email: string | undefined;
  role: string;
  name?: string | null; // Allow name to be null
  updated_at?: string; // Add updated_at if it's part of your Profile type
  // Add other profile fields as needed
}

// Define the shape of the context value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Add signIn, signUp methods here later if needed directly in context
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred.';
};


// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // This effect runs once to set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch the initial session
    const fetchInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
          setLoading(false);
          return;
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
        // If no session, loading is done for the initial check
        if (!data.session) {
            setLoading(false);
        }
        // Profile fetching depends on the user, handled in the next effect
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error("Unhandled error getting initial session:", message);
        setLoading(false);
      }
    };

    fetchInitialSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session);
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);

        // If user logs out, clear profile and stop loading
        if (!currentUser) {
          setProfile(null);
          setLoading(false); // Stop loading when user is confirmed to be null
        }
        // Profile fetching depends on the user, handled in the next effect
      }
    );

    // Cleanup function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  // Helper function to create user profile
  const createUserProfile = async (currentUser: User): Promise<Profile | null> => {
    try {
      const { error } = await supabase.from('profiles').insert({
        id: currentUser.id,
        email: currentUser.email,
        role: 'USER', // Default role
        name: currentUser.user_metadata?.full_name || null,
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      
      // Fetch the newly created profile
      const { data: newProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
        
      return newProfileData as Profile | null;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error in createUserProfile:', message);
      return null;
    }
  };

  // Effect to fetch profile when user state changes and is not null
  useEffect(() => {
    // Only fetch if there's a user and we're not already loading from the auth state change
    if (user) {
      setLoading(true); // Indicate loading for profile fetch
      const fetchProfile = async () => {
          try {
              // Fix the query to use proper filter format
              const { data, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .maybeSingle();

              if (error) {
                  console.error('Error fetching profile:', error);
                  setProfile(null);
              } else if (data) {
                  console.log("Profile fetched:", data);
                  setProfile(data as Profile);
              } else {
                  console.log("No profile found, creating one");
                  // Profile doesn't exist, create it
                  const newProfile = await createUserProfile(user);
                  setProfile(newProfile);
              }
          } catch (err: unknown) {
              const message = getErrorMessage(err);
              console.error("Unhandled error fetching profile:", message);
              setProfile(null);
          } finally {
              setLoading(false); // Stop loading after fetch attempt
          }
      };
      fetchProfile();
    } else {
      // No user, ensure profile is null.
      setProfile(null);
      // setLoading(false) is handled by onAuthStateChange when user becomes null,
      // or by fetchInitialSession if there's no initial user.
    }
  }, [user]); // Only depend on user to prevent re-fetching profile when profile object changes

  // Sign out function
  const signOut = async () => {
    setLoading(true); // Indicate loading when sign out starts
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
             setLoading(false); // Stop loading if sign out itself errors
        }
        // State updates (session, user, profile to null) are handled by onAuthStateChange listener
        // The listener will also set loading to false once the user is confirmed null.
    } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error('Unhandled error signing out:', message);
        setLoading(false); // Stop loading on unhandled error during sign out
    }
  };
  // Only set these values after the component has mounted on the client
  // This prevents hydration mismatches by ensuring the initial render matches the server
  const value = {
    session: mounted ? session : null,
    user: mounted ? user : null, 
    profile: mounted ? profile : null,
    loading: mounted ? loading : true, // Always show loading initially on server/first client render
    signOut,
  };

  // This ensures the same content is rendered on both server and client initially
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};