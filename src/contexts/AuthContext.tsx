import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { login as apiLogin, register as apiRegister, clearToken } from "@/services/api";

interface UserProfile extends Tables<'profiles'> {
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        setUser({
          ...profile,
          email: authUser.email || ''
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    try {
      await apiRegister({ email, password, name });
    } catch (e) {
      console.error("Failed to register in .NET API", e);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    try {
      const res = await apiLogin({ email, password });
      localStorage.setItem("cinepool_user", JSON.stringify(res.user));
    } catch (e) {
      console.error("Failed to login to .NET API", e);
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearToken();
    localStorage.removeItem("cinepool_user");
    setUser(null);
  }, []);

  const isLoggedIn = !!user && !loading;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
