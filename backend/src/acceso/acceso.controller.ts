import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { RequiereRol } from '../auth/roles.decorator';
import type { RolUsuario } from '../auth/rol-usuario';
import {
  CheckInRequestDto,
  CheckInResponseDto,
  CheckOutRequestDto,
  EmitirTotpDto,
  EmitirTotpResponseDto,
  PresenciasResponseDto,
  SyncCheckInsRequestDto,
  SyncCheckInsResponseDto,
  TotpCodigoResponseDto,
  TotpMeResponseDto,
} from './acceso.dto';
import { AccesoService } from './acceso.service';

@ApiTags('acceso')
@Controller('acceso')
export class AccesoController {
  constructor(private readonly service: AccesoService) {}

  @Get('totp/me')
  @RequiereRol('socio')
  @ApiOperation({
    summary: 'Material TOTP del socio autenticado',
    description:
      'Devuelve el secreto base32 (period 60 s) para armar el QR regenerativo en el cliente.',
  })
  @ApiOkResponse({ type: TotpMeResponseDto })
  @ApiNotFoundResponse({ description: 'Sin seed TOTP activo' })
  totpMe(@CurrentUser() user: AuthUserDto): Promise<TotpMeResponseDto> {
    return this.service.totpMe(user.id);
  }

  @Get('totp/me/codigo')
  @RequiereRol('socio')
  @ApiOperation({
    summary: 'Código TOTP actual (demo / debug)',
    description: 'Útil para probar check-in sin escanear QR.',
  })
  @ApiOkResponse({ type: TotpCodigoResponseDto })
  totpCodigo(@CurrentUser() user: AuthUserDto): Promise<TotpCodigoResponseDto> {
    return this.service.totpCodigo(user.id);
  }

  @Post('totp/emitir')
  @RequiereRol('gerente', 'admin_sede')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emite o rota el seed TOTP de un perfil',
    description:
      'Requiere TOTP_SEED_ENCRYPTION_KEY. El seed demo del socio ya viene del seed SQL.',
  })
  @ApiCreatedResponse({ type: EmitirTotpResponseDto })
  emitir(@Body() body: EmitirTotpDto): Promise<EmitirTotpResponseDto> {
    return this.service.emitirTotp(body.perfilId);
  }

  @Post('check-ins/sync')
  @RequiereRol('admin_sede', 'gerente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync batch de check-ins offline',
    description:
      'Procesa la cola local. HTTP 200 siempre; cada ítem trae ok o code tipado. ' +
      'Reintento con el mismo clientEventId es idempotente (no revalida TOTP). Máx. 50 ítems.',
  })
  @ApiOkResponse({ type: SyncCheckInsResponseDto })
  @ApiBadRequestResponse({ description: 'Batch inválido o > 50 ítems' })
  syncCheckIns(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Body() body: SyncCheckInsRequestDto,
  ): Promise<SyncCheckInsResponseDto> {
    return this.service.syncCheckIns(
      { id: user.id, rol: this.requireRol(req) },
      body?.items ?? [],
    );
  }

  @Post('check-ins')
  @RequiereRol('admin_sede', 'gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Check-in online (membresía + TOTP + presencia)',
    description:
      'RN-01 lo impone la BD vía RPC registrar_check_in (unique en presencias).',
  })
  @ApiCreatedResponse({ type: CheckInResponseDto })
  @ApiUnauthorizedResponse({ description: 'TOTP inválido' })
  @ApiForbiddenResponse({ description: 'Membresía inactiva o sede no asignada' })
  @ApiConflictResponse({ description: 'YA_DENTRO / YA_EN_OTRA_SEDE' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  checkIn(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Body() body: CheckInRequestDto,
  ): Promise<CheckInResponseDto> {
    return this.service.checkIn(
      { id: user.id, rol: this.requireRol(req) },
      body,
    );
  }

  @Post('check-outs')
  @RequiereRol('admin_sede', 'gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Check-out: libera presencia e inserta historial' })
  @ApiCreatedResponse({ type: CheckInResponseDto })
  @ApiNotFoundResponse({ description: 'Sin presencia abierta' })
  checkOut(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Body() body: CheckOutRequestDto,
  ): Promise<CheckInResponseDto> {
    return this.service.checkOut(
      { id: user.id, rol: this.requireRol(req) },
      body,
    );
  }

  @Get('presencias')
  @RequiereRol('admin_sede', 'gerente')
  @ApiOperation({
    summary: 'Quién está dentro de la sede (+ aforo soft)',
  })
  @ApiQuery({ name: 'sedeId', required: true })
  @ApiOkResponse({ type: PresenciasResponseDto })
  listarPresencias(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Query('sedeId') sedeId: string,
  ): Promise<PresenciasResponseDto> {
    return this.service.listarPresencias(
      { id: user.id, rol: this.requireRol(req) },
      sedeId,
    );
  }

  @Get('check-ins')
  @RequiereRol('admin_sede', 'gerente')
  @ApiOperation({ summary: 'Últimos check-ins de la sede (auditoría corta)' })
  @ApiQuery({ name: 'sedeId', required: true })
  @ApiOkResponse({ type: [CheckInResponseDto] })
  listarCheckIns(
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
    @Query('sedeId') sedeId: string,
  ): Promise<CheckInResponseDto[]> {
    return this.service.listarCheckIns(
      { id: user.id, rol: this.requireRol(req) },
      sedeId,
    );
  }

  private requireRol(req: AuthenticatedRequest): RolUsuario {
    if (!req.rol) {
      throw new ForbiddenException('Rol no resuelto');
    }
    return req.rol;
  }
}
