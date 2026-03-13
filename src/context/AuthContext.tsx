import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, mockUsers } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthorized: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, role: UserRole) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) {
      setUser({ ...found, username });
      return true;
    }
    // Create ad-hoc user
    setUser({ id: `u-${Date.now()}`, username, role, agency: role === "border_security" ? "Border Protection Agency" : role === "humanitarian_ngo" ? "NGO Partner" : "Admin" });
    return true;
  };

  const logout = () => setUser(null);
  const isAuthorized = (requiredRole: UserRole) => user?.role === requiredRole || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
