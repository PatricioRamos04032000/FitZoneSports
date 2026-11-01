import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPaymentRequiredResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../../auth/auth-user.dto';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ReservarCanchaDto,
  ReservaCanchaResponseDto,
} from './reserva-cancha.dto';
import { ReservasCanchaService } from './reservas-cancha.service';

@ApiTags('canchas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
@UseGuards(JwtAuthGuard)
@Controller('canchas/reservas')
export class ReservasCanchaController {
  constructor(private readonly service: ReservasCanchaService) {}

  @Post()
  @ApiOperation({
    summary: 'Reservar una cancha',
    description:
      'Facade: calcula precio (Strategy), bloquea el turno (RPC), cobra con pasarela stub y confirma vía State. El perfilId sale solo del JWT.',
  })
  @ApiCreatedResponse({ type: ReservaCanchaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o turno fuera de reglas' })
  @ApiConflictResponse({ description: 'Turno ocupado, cancha inactiva o en mantenimiento' })
  @ApiNotFoundResponse({ description: 'Cancha o perfil inexistente' })
  @ApiPaymentRequiredResponse({
    description: 'Pago rechazado; la reserva quedó cancelada',
  })
  reservar(
    @CurrentUser() user: AuthUserDto,
    @Body() body: ReservarCanchaDto,
  ): Promise<ReservaCanchaResponseDto> {
    return this.service.reservar(user.id, body);
  }

  @Post(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar una reserva propia',
    description:
      'Delega en el patrón State. Solo el dueño (perfilId del JWT) puede cancelar. Sin plazo de cancelación por ahora.',
  })
  @ApiOkResponse({ type: ReservaCanchaResponseDto })
  @ApiBadRequestResponse({ description: 'La reserva no admite cancelación' })
  @ApiForbiddenResponse({ description: 'La reserva pertenece a otro usuario' })
  @ApiNotFoundResponse({ description: 'Reserva inexistente' })
  cancelar(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
  ): Promise<ReservaCanchaResponseDto> {
    return this.service.cancelar(user.id, id);
  }
}
