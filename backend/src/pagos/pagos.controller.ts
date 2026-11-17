import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthUserDto } from '../common/auth-user.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ComprobantesService } from './comprobantes/comprobantes.service';
import { PagoResumenDto } from './pago.dto';

@ApiTags('pagos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly comprobantes: ComprobantesService) {}

  @Get('mios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar mis pagos aprobados',
    description:
      'Devuelve los pagos aprobados del usuario autenticado para descargar sus comprobantes.',
  })
  @ApiOkResponse({ type: [PagoResumenDto] })
  listarMios(@CurrentUser() user: AuthUserDto): Promise<PagoResumenDto[]> {
    return this.comprobantes.listarAprobadosMios(user.id);
  }

  @Get(':id/comprobante')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Descargar comprobante PDF de un pago aprobado (RF-14)',
    description:
      'Genera un comprobante interno no fiscal en PDF. Solo el titular del pago puede descargarlo.',
  })
  @ApiParam({ name: 'id', description: 'ID del pago aprobado' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'Archivo PDF del comprobante' })
  @ApiConflictResponse({ description: 'El pago no está aprobado' })
  @ApiForbiddenResponse({ description: 'El pago pertenece a otro usuario' })
  @ApiNotFoundResponse({ description: 'Pago no encontrado' })
  async descargarComprobante(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const archivo = await this.comprobantes.generarPorPago(id, user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${archivo.filename}"`,
    });
    return new StreamableFile(archivo.buffer);
  }
}
