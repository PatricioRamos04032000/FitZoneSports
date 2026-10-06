import { ArgumentsHost } from '@nestjs/common';
import { RepositoryErrorFilter } from './repository-error.filter';
import { RepositoryError } from './repository.error';

describe('RepositoryErrorFilter', () => {
  it('responde 500 sin exponer el detalle del error', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new RepositoryErrorFilter().catch(
      new RepositoryError('relation "sedes" does not exist', '42P01'),
      host,
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Error al acceder a los datos',
      error: 'Internal Server Error',
    });
  });
});
