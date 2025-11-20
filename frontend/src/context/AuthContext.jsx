import React, { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

// Test user data (mock database - no MongoDB needed)
const TEST_USERS = {
  "admin@gmail.com": {
    id: "user1",
    email: "admin@gmail.com",
    password: "1233",
  },
};

// Test URLs data (mock database)
const MOCK_URLS = [
  {
    shortId: "abc123",
    originalUrl: "https://www.google.com/search?q=javascript",
    customAlias: null,
    clicks: 42,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    shortId: "def456",
    originalUrl: "https://github.com/facebook/react",
    customAlias: "react-repo",
    clicks: 28,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    shortId: "ghi789",
    originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    customAlias: null,
    clicks: 156,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    shortId: "jkl012",
    originalUrl: "https://stackoverflow.com/questions/",
    customAlias: "stack-overflow",
    clicks: 89,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

  // Signup function (using custom data)
  const signup = async (email, password) => {
    try {
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if user already exists
      if (TEST_USERS[email]) {
        throw new Error("User already exists");
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
      };

      // Add to test users (in real app, would save to DB)
      TEST_USERS[email] = newUser;

      // Create token
      const token = `token_${Date.now()}`;

      // Set state
      setToken(token);
      setUser(newUser);

      // Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(newUser));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Login function (using custom data)
  const login = async (email, password) => {
    try {
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if user exists
      const user = TEST_USERS[email];
      if (!user) {
        throw new Error("User not found");
      }

      // Check password
      if (user.password !== password) {
        throw new Error("Invalid password");
      }

      // Create token
      const token = `token_${Date.now()}`;

      // Set state
      setToken(token);
      setUser(user);

      // Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

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

// Export mock data for use in other components
export { TEST_USERS, MOCK_URLS };