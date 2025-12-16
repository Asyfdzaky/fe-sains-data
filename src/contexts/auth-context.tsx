"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  getToken,
  setToken,
  removeToken,
  decodeToken,
  User,
  RegisterRequest,
  LoginRequest,
} from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    const loadUser = () => {
      const savedToken = getToken();
      if (savedToken) {
        const userData = decodeToken(savedToken);
        if (userData) {
          setUser(userData);
          setTokenState(savedToken);
        } else {
          removeToken();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      const userData = decodeToken(response.token);

      if (userData) {
        setToken(response.token);
        setTokenState(response.token);
        setUser(userData);
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      const userData = decodeToken(response.token);

      if (userData) {
        setToken(response.token);
        setTokenState(response.token);
        setUser(userData);
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
