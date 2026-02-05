import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, urlApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Transfer anonymous URLs to user account
  const transferAnonymousUrls = useCallback(async (authToken) => {
    const anonymousUrls = localStorage.getItem("anonymousUrls");
    if (!anonymousUrls) return;

    try {
      const urls = JSON.parse(anonymousUrls);
      if (urls.length > 0) {
        // Temporarily set the token for the API call
        localStorage.setItem("authToken", authToken);
        await urlApi.transfer(urls);
        localStorage.removeItem("anonymousUrls");
      }
    } catch (err) {
      console.error("Error transferring anonymous URLs:", err);
    }
  }, []);

  // Register function
  const register = async (email, password, confirmPassword) => {
    try {
      const data = await authApi.register(email, password, confirmPassword);
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));

      // Transfer anonymous URLs
      await transferAnonymousUrls(data.token);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));

      // Transfer anonymous URLs
      await transferAnonymousUrls(data.token);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAuthenticated,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};