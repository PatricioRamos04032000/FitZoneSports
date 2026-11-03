
import { createContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  rol: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
