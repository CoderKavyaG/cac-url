import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { urlApi } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse JWT token to get user info
  const parseToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Transfer anonymous URLs to user account
  const transferAnonymousUrls = useCallback(async (authToken) => {
    const anonymousUrls = localStorage.getItem("anonymousUrls");
    if (!anonymousUrls) return;

    try {
      const urls = JSON.parse(anonymousUrls);
      if (urls.length > 0) {
        localStorage.setItem("authToken", authToken);
        await urlApi.transfer(urls);
        localStorage.removeItem("anonymousUrls");
      }
    } catch (err) {
      console.error("Error transferring anonymous URLs:", err);
    }
  }, []);

  // Handle Google OAuth callback token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error("Auth error:", error);
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false);
      return;
    }

    if (tokenFromUrl) {
      // Got token from Google OAuth callback
      const userData = parseToken(tokenFromUrl);
      if (userData) {
        setToken(tokenFromUrl);
        setUser({
          id: userData.userId,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        });
        localStorage.setItem("authToken", tokenFromUrl);
        localStorage.setItem("authUser", JSON.stringify({
          id: userData.userId,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        }));
        
        // Transfer anonymous URLs
        transferAnonymousUrls(tokenFromUrl);
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false);
      return;
    }

    // Check for existing token in localStorage
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");
    
    if (savedToken && savedUser) {
      const userData = parseToken(savedToken);
      // Check if token is expired
      if (userData && userData.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Token expired, clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      }
    }
    setLoading(false);
  }, [transferAnonymousUrls]);

  // Google Sign In - redirect to backend
  const signInWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
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
      signInWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
