import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificacionDto, PreferenciasNotificacionDto } from './notificacion.dto';
import { Notificacion, PreferenciasNotificacion } from './notificacion.model';
import { NotificacionesService } from './notificaciones.service';

@ApiTags('notificaciones')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Notificaciones del usuario, de la más nueva a la más vieja' })
  @ApiOkResponse({ type: [NotificacionDto] })
  listar(@CurrentUser() user: AuthUserDto): Promise<Notificacion[]> {
    return this.service.listar(user.id);
  }

  @Get('preferencias')
  @ApiOperation({ summary: 'Preferencias de notificación del usuario' })
  @ApiOkResponse({ type: PreferenciasNotificacionDto })
  @ApiNotFoundResponse({ description: 'El usuario no tiene perfil' })
  getPreferencias(@CurrentUser() user: AuthUserDto): Promise<PreferenciasNotificacion> {
    return this.service.getPreferencias(user.id);
  }

  @Patch('preferencias')
  @ApiOperation({ summary: 'Activa o desactiva el aviso por email (simulado)' })
  @ApiOkResponse({ type: PreferenciasNotificacionDto })
  @ApiBadRequestResponse({ description: 'notificar_por_email debe ser booleano' })
  @ApiNotFoundResponse({ description: 'El usuario no tiene perfil' })
  actualizarPreferencias(
    @CurrentUser() user: AuthUserDto,
    @Body() body: PreferenciasNotificacionDto,
  ): Promise<PreferenciasNotificacion> {
    if (typeof body?.notificar_por_email !== 'boolean') {
      throw new BadRequestException('notificar_por_email debe ser booleano');
    }
    return this.service.actualizarPreferencias(user.id, {
      notificar_por_email: body.notificar_por_email,
    });
  }

  @Patch(':id/leida')
  @ApiOperation({ summary: 'Marca una notificación como leída' })
  @ApiOkResponse({ type: NotificacionDto })
  @ApiNotFoundResponse({ description: 'La notificación no existe o no es del usuario' })
  marcarLeida(
    @CurrentUser() user: AuthUserDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Notificacion> {
    return this.service.marcarLeida(id, user.id);
  }
}
