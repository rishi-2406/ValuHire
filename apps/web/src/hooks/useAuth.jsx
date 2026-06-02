import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, userService, setTokens, getRefreshToken, clearTokens } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      // If we have a refresh token in storage, exchange it for a fresh access token first.
      // This makes auth survive page refreshes since access tokens are in-memory only.
      const rt = getRefreshToken();
      if (rt) {
        try {
          const res = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: rt })
          });
          const json = await res.json().catch(() => ({}));
          const data = json.data !== undefined ? json.data : json;
          if (res.ok && data.accessToken) {
            setTokens({ accessToken: data.accessToken, refreshToken: rt });
          } else {
            clearTokens();
            setUser(null);
            return;
          }
        } catch {
          clearTokens();
          setUser(null);
          return;
        }
      }
      const data = await authService.me();
      setUser(data.user || data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async ({ name, email, password, role, companyName }) => {
    setError(null);
    try {
      const data = await authService.register({ name, email, password, role, companyName });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    clearTokens();
    setUser(null);
  };

  const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));

  const value = { user, loading, error, login, register, logout, checkAuth, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}