import { createContext } from "react";
import { esRolUsuario, type RolUsuario } from "./rol";

export type { RolUsuario };

export interface AuthUser {
  id: string;
  email: string;
  /** Rol de Supabase Auth (`authenticated`), no el de FitZone. */
  role: string;
  /** Rol de FitZone (`perfiles.rol`). null si no viene o no es uno de los cuatro. */
  rol: RolUsuario | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function normalizarUsuario(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const body = data as Record<string, unknown>;
  if (typeof body.id !== "string") {
    return null;
  }

  return {
    id: body.id,
    email: typeof body.email === "string" ? body.email : "",
    role: typeof body.role === "string" ? body.role : "",
    rol: esRolUsuario(body.rol) ? body.rol : null,
  };
}
