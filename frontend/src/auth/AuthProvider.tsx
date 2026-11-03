
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth";
import type { AuthUser } from "./auth";
import { apiRequest } from "../services/api";

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

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const validateSession = async () => {
      try {
        const data: AuthUser = await apiRequest("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(data);
      } catch {
        sessionStorage.removeItem("access_token");
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [accessToken]);

  const login = (token: string) => {
    sessionStorage.setItem("access_token", token);
    setIsLoading(true);
    setAccessToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    setAccessToken(null);
    setUser(null);
    setIsLoading(false);
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
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
