'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

// Define the shape of the profile data we expect
interface Profile {
  id: string;
  email: string | undefined;
  role: string;
  name?: string;
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
      } catch (err: any) {
        console.error("Unhandled error getting initial session:", err);
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
          setLoading(false);
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
  const createUserProfile = async (currentUser: User) => {
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
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
        
      return newProfile as Profile;
    } catch (err) {
      console.error('Error in createUserProfile:', err);
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
          } catch (err: any) {
              console.error("Unhandled error fetching profile:", err);
              setProfile(null);
          } finally {
              setLoading(false); // Stop loading after fetch attempt
          }
      };
      fetchProfile();
    } else {
      // No user, ensure profile is null.
      // Loading state is handled by the auth listener or initial load.
      if (profile !== null) setProfile(null);
    }
  }, [user]); // Dependency on user state

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            // Even if signout fails, the state might change, let listener handle it
            // setLoading(false); // Let listener handle loading state
        }
        // State updates (session, user, profile to null) are handled by onAuthStateChange listener
    } catch (err: any) {
        console.error('Unhandled error signing out:', err);
        // setLoading(false); // Let listener handle loading state
    }
  };
  // Only set these values after the component has mounted on the client
  // This prevents hydration mismatches by ensuring the initial render matches the server
  const value = {
    session: mounted ? session : null,
    user: mounted ? user : null, 
    profile: mounted ? profile : null,
    loading: mounted ? loading : true, // Always show loading initially
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
