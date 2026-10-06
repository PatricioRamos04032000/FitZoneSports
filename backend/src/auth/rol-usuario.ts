/** Valores del enum `public.rol_usuario`. */
export const ROLES_USUARIO = ['socio', 'externo', 'recepcionista', 'gerente'] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

/** Clave de metadata de `@Roles`. */
export const ROLES_KEY = 'roles';
