
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "./types";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('atmInsightUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user data');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock login function - in a real app this would call an API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials
      if (email === "admin@atminsight.com" && password === "password") {
        const userData: User = {
          id: "1",
          name: "Admin User",
          email: email,
          role: "admin"
        };
        setUser(userData);
        localStorage.setItem('atmInsightUser', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('atmInsightUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
