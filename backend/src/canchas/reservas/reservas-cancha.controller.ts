import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../../auth/auth-user.dto';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  IniciarPagoResponseDto,
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reservar una cancha (hold pendiente)',
    description:
      'Facade: calcula precio (Strategy) y bloquea el turno en estado pendiente. No cobra: usar POST /:id/pagar y el checkout simulado.',
  })
  @ApiCreatedResponse({ type: ReservaCanchaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o turno fuera de reglas' })
  @ApiConflictResponse({ description: 'Turno ocupado, cancha inactiva o en mantenimiento' })
  @ApiNotFoundResponse({ description: 'Cancha o perfil inexistente' })
  reservar(
    @CurrentUser() user: AuthUserDto,
    @Body() body: ReservarCanchaDto,
  ): Promise<ReservaCanchaResponseDto> {
    return this.service.reservar(user.id, body);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar mis reservas',
    description:
      'Incluye pendientes (para retomar pago), confirmadas y canceladas del perfil del JWT.',
  })
  @ApiOkResponse({ type: [ReservaCanchaResponseDto] })
  listarMias(
    @CurrentUser() user: AuthUserDto,
  ): Promise<ReservaCanchaResponseDto[]> {
    return this.service.listarMias(user.id);
  }

  @Post(':id/pagar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar o retomar pago de una reserva pendiente',
    description:
      'Idempotente: reutiliza el pago pendiente existente y devuelve la URL del checkout simulado.',
  })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiOkResponse({ type: IniciarPagoResponseDto })
  @ApiBadRequestResponse({ description: 'La reserva no está pendiente' })
  @ApiConflictResponse({ description: 'Hold vencido; reserva cancelada' })
  @ApiForbiddenResponse({ description: 'La reserva pertenece a otro usuario' })
  @ApiNotFoundResponse({ description: 'Reserva inexistente' })
  iniciarPago(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
  ): Promise<IniciarPagoResponseDto> {
    return this.service.iniciarPago(user.id, id);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar una reserva propia',
    description:
      'Delega en el patrón State. Solo el dueño (perfilId del JWT) puede cancelar.',
  })
  @ApiParam({ name: 'id', description: 'ID de la reserva a cancelar' })
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
