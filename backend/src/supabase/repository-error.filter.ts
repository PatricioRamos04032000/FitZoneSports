import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RepositoryError } from './repository.error';

/** Respuesta por defecto para errores de datos que el servicio no tradujo. */
@Catch(RepositoryError)
export class RepositoryErrorFilter implements ExceptionFilter {
  catch(_error: RepositoryError, host: ArgumentsHost): void {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al acceder a los datos',
        error: 'Internal Server Error',
      });
  }
}
