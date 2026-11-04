import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import type { RolUsuario } from '../auth/rol-usuario';
import { RequiereRol } from '../auth/roles.decorator';
import {
  ActualizarConfiguracionPicoDto,
  ActualizarDescuentoSocioDto,
  ConfiguracionPicoDto,
  DescuentoSocioResponseDto,
} from './cancha.dto';
import { CanchasService } from './canchas.service';

@ApiTags('canchas')
@Controller()
export class ConfiguracionPreciosController {
  constructor(private readonly service: CanchasService) {}

  @Get('sedes/:id/configuracion-pico')
  @ApiOperation({
    summary: 'Consultar configuración de horario pico de una sede (S4-T09 P3)',
    description:
      'Público: permite mostrar en la grilla qué franja y días tienen recargo por horario pico.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la sede' })
  @ApiOkResponse({ type: ConfiguracionPicoDto })
  @ApiBadRequestResponse({ description: 'UUID inválido' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  obtenerConfiguracionPico(
    @Param('id') sedeId: string,
  ): Promise<ConfiguracionPicoDto> {
    return this.service.obtenerConfiguracionPico(sedeId);
  }

  @Put('sedes/:id/configuracion-pico')
  @RequiereRol('gerente', 'admin_sede')
  @ApiOperation({
    summary: 'Actualizar configuración de horario pico de una sede (S4-T09 P3)',
    description:
      'Lo editan el administrador asignado a esa sede o el Gerente Central. Solo afecta reservas nuevas.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la sede' })
  @ApiOkResponse({ type: ConfiguracionPicoDto })
  @ApiBadRequestResponse({ description: 'Parámetros de horario pico inválidos' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  actualizarConfiguracionPico(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Param('id') sedeId: string,
    @Body() body: ActualizarConfiguracionPicoDto,
  ): Promise<ConfiguracionPicoDto> {
    return this.service.actualizarConfiguracionPico(
      { id: user.id, rol: this.requireRol(req) },
      sedeId,
      body,
    );
  }

  @Get('configuracion/descuento-socio')
  @ApiOperation({
    summary: 'Consultar porcentaje global de descuento de socio (S4-T09 P8)',
  })
  @ApiOkResponse({ type: DescuentoSocioResponseDto })
  obtenerDescuentoSocio(): Promise<DescuentoSocioResponseDto> {
    return this.service.obtenerDescuentoSocio();
  }

  @Put('configuracion/descuento-socio')
  @RequiereRol('gerente')
  @ApiOperation({
    summary: 'Actualizar porcentaje global de descuento de socio (S4-T09 P8)',
    description:
      'Único valor para toda la cadena; solo editable por el Gerente Central.',
  })
  @ApiOkResponse({ type: DescuentoSocioResponseDto })
  @ApiBadRequestResponse({ description: 'Porcentaje fuera de rango (0 a 100)' })
  actualizarDescuentoSocio(
    @Body() body: ActualizarDescuentoSocioDto,
  ): Promise<DescuentoSocioResponseDto> {
    return this.service.actualizarDescuentoSocio(body);
  }

  private requireRol(req: AuthenticatedRequest): RolUsuario {
    if (!req.rol) {
      throw new ForbiddenException('Rol no resuelto');
    }
    return req.rol;
  }
}
