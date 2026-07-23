"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authApi, AuthUser } from "./api";

const TOKEN_KEY = "accessToken";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session from a previously saved token on first load.
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    authApi
      .me(savedToken)
      .then((me) => {
        setToken(savedToken);
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function persistSession(accessToken: string, authUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(authUser);
  }

  async function register(email: string, password: string) {
    const { accessToken, user: authUser } = await authApi.register(
      email,
      password,
    );
    persistSession(accessToken, authUser);
  }

  async function login(email: string, password: string) {
    const { accessToken, user: authUser } = await authApi.login(
      email,
      password,
    );
    persistSession(accessToken, authUser);
  }

  async function logout() {
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  // Re-fetches the current user (e.g. after editing the profile/avatar).
  async function refreshUser() {
    if (!token) return;
    const me = await authApi.me(token);
    setUser(me);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, register, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
