import React, { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  // Signup function (real MongoDB API)
  const signup = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      // Save to localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Login function (real MongoDB API)
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      // Save to localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));

      // Transfer anonymous URLs to user account
      const anonymousUrls = localStorage.getItem("anonymousUrls");
      if (anonymousUrls) {
        try {
          const urls = JSON.parse(anonymousUrls);
          if (urls.length > 0) {
            // Send anonymous URLs to backend for transfer
            await fetch(`${API_URL}/urls/transfer`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ urls }),
            });
            // Clear anonymous URLs after successful transfer
            localStorage.removeItem("anonymousUrls");
          }
        } catch (err) {
          console.error("Error transferring anonymous URLs:", err);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
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