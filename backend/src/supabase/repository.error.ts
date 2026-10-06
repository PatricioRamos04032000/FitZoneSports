/**
 * Error de acceso a datos lanzado por los repositorios.
 * Para errores de negocio de funciones RPC (`raise exception 'CLASE_LLENA'`),
 * `message` trae el código del error y `code` es `P0001`.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly details?: string,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
