import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext, normalizarUsuario } from "./auth";
import type { AuthUser } from "./auth";
import { apiRequest, registrarCierreDeSesion } from "../services/api";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem("access_token")
  );

  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(
    () => sessionStorage.getItem("access_token") !== null
  );

  const isAuthenticated = accessToken !== null;

  const logout = useCallback(() => {
    sessionStorage.removeItem("access_token");
    setAccessToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    registrarCierreDeSesion(logout);
  }, [logout]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const validateSession = async () => {
      try {
        const data: unknown = await apiRequest("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(normalizarUsuario(data));
      } catch {
        sessionStorage.removeItem("access_token");
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void validateSession();
  }, [accessToken]);

  const login = (token: string) => {
    sessionStorage.setItem("access_token", token);
    setIsLoading(true);
    setAccessToken(token);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        accessToken,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
