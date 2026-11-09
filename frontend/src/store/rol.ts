/** Mismos valores que el enum `public.rol_usuario` del backend. */
export const ROLES_USUARIO = ["socio", "externo", "admin_sede", "gerente"] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

export function esRolUsuario(valor: unknown): valor is RolUsuario {
  return (
    typeof valor === "string" &&
    (ROLES_USUARIO as readonly string[]).includes(valor)
  );
}
