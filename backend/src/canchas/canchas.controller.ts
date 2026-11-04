import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import type { RolUsuario } from '../auth/rol-usuario';
import { RequiereRol } from '../auth/roles.decorator';
import {
  ActualizarCanchaDto,
  CanchaResponseDto,
  CrearCanchaDto,
  CrearMantenimientoDto,
  DisponibilidadSedeResponseDto,
  MantenimientoCanchaResponseDto,
} from './cancha.dto';
import { CanchasService } from './canchas.service';

@ApiTags('canchas')
@Controller('canchas')
export class CanchasController {
  constructor(private readonly service: CanchasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar canchas de una sede',
    description:
      'Devuelve por defecto las canchas activas de la sede indicada con su tipo y precio base por hora (RF-09).',
  })
  @ApiQuery({ name: 'sedeId', required: true, description: 'UUID de la sede' })
  @ApiQuery({
    name: 'incluirInactivas',
    required: false,
    type: Boolean,
    description: 'Si es true, incluye también canchas dadas de baja/inactivas',
  })
  @ApiOkResponse({ type: [CanchaResponseDto] })
  @ApiBadRequestResponse({ description: 'sedeId ausente o con formato inválido' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  listarPorSede(
    @Query('sedeId') sedeId: string,
    @Query('incluirInactivas') incluirInactivas?: string,
  ): Promise<CanchaResponseDto[]> {
    return this.service.listarPorSede(sedeId, incluirInactivas === 'true');
  }

  @Get('disponibilidad')
  @ApiOperation({
    summary: 'Consultar grilla horaria de disponibilidad por sede y fecha',
    description:
      'Arma turnos de 60 minutos en hora en punto (hora Argentina), cruza reservas vigentes y períodos de mantenimiento, y calcula precios externo/socio con el patrón Strategy (RF-10, RF-11, RNF-03).',
  })
  @ApiQuery({ name: 'sedeId', required: true, description: 'UUID de la sede' })
  @ApiQuery({
    name: 'fecha',
    required: true,
    example: '2026-11-15',
    description: 'Fecha calendario en hora Argentina (YYYY-MM-DD)',
  })
  @ApiOkResponse({ type: DisponibilidadSedeResponseDto })
  @ApiBadRequestResponse({ description: 'sedeId o fecha inválidos' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  consultarDisponibilidad(
    @Query('sedeId') sedeId: string,
    @Query('fecha') fecha: string,
  ): Promise<DisponibilidadSedeResponseDto> {
    return this.service.consultarDisponibilidad(sedeId, fecha);
  }

  @Post()
  @RequiereRol('gerente', 'admin_sede')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Dar de alta una cancha en una sede (RF-09)',
    description:
      'El gerente puede crear en cualquier sede; el administrador de sede solo en las sedes que tiene asignadas.',
  })
  @ApiCreatedResponse({ type: CanchaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos de alta inválidos' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  crearCancha(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Body() body: CrearCanchaDto,
  ): Promise<CanchaResponseDto> {
    return this.service.crearCancha(
      { id: user.id, rol: this.requireRol(req) },
      body,
    );
  }

  @Patch(':id')
  @RequiereRol('gerente', 'admin_sede')
  @ApiOperation({
    summary: 'Actualizar precio base, nombre o estado activo de una cancha',
    description:
      'Los cambios de precio solo afectan reservas nuevas; las ya realizadas conservan su monto (S4-T09 P1 y P6).',
  })
  @ApiParam({ name: 'id', description: 'UUID de la cancha' })
  @ApiOkResponse({ type: CanchaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o body vacío' })
  @ApiNotFoundResponse({ description: 'Cancha inexistente' })
  actualizarCancha(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ActualizarCanchaDto,
  ): Promise<CanchaResponseDto> {
    return this.service.actualizarCancha(
      { id: user.id, rol: this.requireRol(req) },
      id,
      body,
    );
  }

  @Get(':id/mantenimientos')
  @ApiOperation({
    summary: 'Listar períodos de mantenimiento de una cancha (RF-12)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la cancha' })
  @ApiOkResponse({ type: [MantenimientoCanchaResponseDto] })
  @ApiBadRequestResponse({ description: 'UUID inválido' })
  @ApiNotFoundResponse({ description: 'Cancha inexistente' })
  listarMantenimientos(
    @Param('id') id: string,
  ): Promise<MantenimientoCanchaResponseDto[]> {
    return this.service.listarMantenimientos(id);
  }

  @Post(':id/mantenimientos')
  @RequiereRol('gerente', 'admin_sede')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Programar un período de mantenimiento para una cancha (RF-12)',
    description:
      'Bloquea reservas futuras dentro del rango [desde, hasta) sin cancelar las reservas ya tomadas.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la cancha' })
  @ApiCreatedResponse({ type: MantenimientoCanchaResponseDto })
  @ApiBadRequestResponse({ description: 'Rango de fechas inválido' })
  @ApiNotFoundResponse({ description: 'Cancha inexistente' })
  crearMantenimiento(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: CrearMantenimientoDto,
  ): Promise<MantenimientoCanchaResponseDto> {
    return this.service.crearMantenimiento(
      { id: user.id, rol: this.requireRol(req) },
      id,
      body,
    );
  }

  @Delete(':id/mantenimientos/:mantenimientoId')
  @RequiereRol('gerente', 'admin_sede')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un período de mantenimiento de una cancha',
  })
  @ApiParam({ name: 'id', description: 'UUID de la cancha' })
  @ApiParam({ name: 'mantenimientoId', description: 'UUID del mantenimiento' })
  @ApiNoContentResponse({ description: 'Mantenimiento eliminado' })
  @ApiNotFoundResponse({ description: 'Cancha o mantenimiento inexistente' })
  eliminarMantenimiento(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('mantenimientoId') mantenimientoId: string,
  ): Promise<void> {
    return this.service.eliminarMantenimiento(
      { id: user.id, rol: this.requireRol(req) },
      id,
      mantenimientoId,
    );
  }

  private requireRol(req: AuthenticatedRequest): RolUsuario {
    if (!req.rol) {
      throw new ForbiddenException('Rol no resuelto');
    }
    return req.rol;
  }
}
