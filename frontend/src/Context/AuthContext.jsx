// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      console.log("🔍 AuthProvider - Checking auth status");
      console.log("🔍 Token exists:", !!token);
      console.log("🔍 Saved user:", savedUser);

      if (token && savedUser && savedUser !== 'undefined') {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && typeof userData === 'object') {
            setUser(userData);
            setIsAuthenticated(true);
            console.log("✅ AuthProvider - User authenticated:", userData);
          } else {
            console.warn("⚠️ Invalid user data format");
            logout();
          }
        } catch (parseError) {
          console.error("❌ Error parsing user data:", parseError);
          logout();
        }
      } else {
        console.log("❌ No valid authentication data found");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("❌ AuthProvider - Error checking auth status:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    try {
      console.log("🔐 AuthProvider - Logging in user:", userData);
      console.log("🔐 AuthProvider - Token:", token);
      
      if (!userData || !token) {
        console.error("❌ AuthProvider - Missing userData or token");
        throw new Error("Missing user data or token");
      }

      // Validate userData structure
      if (typeof userData !== 'object') {
        console.error("❌ AuthProvider - Invalid userData type:", typeof userData);
        throw new Error("Invalid user data format");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log("✅ AuthProvider - Login successful");
      console.log("✅ AuthProvider - User set to:", userData);
      console.log("✅ AuthProvider - isAuthenticated:", true);
      
    } catch (error) {
      console.error("❌ AuthProvider - Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 AuthProvider - Logging out");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      checkAuthStatus 
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