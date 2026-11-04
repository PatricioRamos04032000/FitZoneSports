import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { RequiereRol } from '../auth/roles.decorator';
import {
  ClaseConCupoResponseDto,
  InscribirClaseDto,
  InscripcionClaseResponseDto,
} from './clase.dto';
import { ClasesService } from './clases.service';

@ApiTags('clases')
@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar clases con cupos disponibles por sede' })
  @ApiQuery({ name: 'sedeId', required: true, format: 'uuid' })
  @ApiOkResponse({ type: ClaseConCupoResponseDto, isArray: true })
  @ApiBadRequestResponse({ description: 'sedeId ausente o con formato UUID inválido' })
  @ApiUnauthorizedResponse({ description: 'Falta o es inválido el token Bearer' })
  findConCupoPorSede(@Query('sedeId', ParseUUIDPipe) sedeId: string) {
    return this.clasesService.findConCupoPorSede(sedeId);
  }

  @Get('inscripciones/mias')
  @RequiereRol('socio')
  @ApiOperation({ summary: 'Listar las inscripciones a clases del socio autenticado' })
  @ApiOkResponse({ type: InscripcionClaseResponseDto, isArray: true })
  listarMisInscripciones(@CurrentUser() user: AuthUserDto) {
    return this.clasesService.listarMisInscripciones(user.id);
  }

  @Post('inscripciones')
  @RequiereRol('socio')
  @ApiOperation({
    summary: 'Inscribir al socio autenticado en una clase (RN-03 membresía vigente + D5 ventana 48 h)',
  })
  @ApiCreatedResponse({ type: InscripcionClaseResponseDto })
  @ApiBadRequestResponse({
    description: 'claseId inválido o faltan menos de 48 horas para el inicio de la clase (D5)',
  })
  @ApiForbiddenResponse({
    description: 'Rol no permitido o socio sin membresía activa vigente (RN-03)',
  })
  @ApiNotFoundResponse({ description: 'La clase solicitada no existe' })
  @ApiConflictResponse({
    description: 'Clase cancelada, sin cupo, con lista de espera activa o socio ya inscripto',
  })
  inscribir(
    @Body() dto: InscribirClaseDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.clasesService.inscribir(dto?.claseId, user.id);
  }

  @Delete('inscripciones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiereRol('socio', 'admin_sede', 'gerente')
  @ApiOperation({
    summary:
      'Cancelar una inscripción a clase (valida titularidad, calcula D6 desde la BD y notifica lista de espera por Observer)',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'UUID de la inscripción' })
  @ApiNoContentResponse({ description: 'Inscripción cancelada correctamente' })
  @ApiBadRequestResponse({ description: 'ID inválido o inscripción ya cancelada' })
  @ApiForbiddenResponse({ description: 'Un socio no puede cancelar la inscripción de otro usuario' })
  @ApiNotFoundResponse({ description: 'La inscripción no fue encontrada' })
  cancelar(
    @Param('id', ParseUUIDPipe) inscripcionId: string,
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clasesService.cancelar(inscripcionId, user.id, req.rol);
  }
}
