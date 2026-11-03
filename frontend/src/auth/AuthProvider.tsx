import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isAuthenticated = accessToken !== null;

  const login = (token: string) => {
    setAccessToken(token);
  };

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}