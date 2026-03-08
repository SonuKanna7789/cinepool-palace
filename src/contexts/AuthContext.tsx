import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { isAuthenticated, clearToken, setToken } from "@/services/api/client";
import type { UserProfile } from "@/services/api/types";

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  loginUser: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loginUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("cinepool_user");
    return stored ? JSON.parse(stored) : null;
  });

  const isLoggedIn = isAuthenticated() && !!user;

  const loginUser = useCallback((token: string, profile: UserProfile) => {
    setToken(token);
    localStorage.setItem("cinepool_user", JSON.stringify(profile));
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("cinepool_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
