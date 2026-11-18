import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { AuthUserDto } from '../common/auth-user.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard, type AuthenticatedRequest } from '../common/jwt-auth.guard';
import { RequiereRol } from '../common/roles.decorator';
import {
  AnotarseListaEsperaDto,
  ClaseConCupoResponseDto,
  ClaseResponseDto,
  CrearClaseDto,
  EditarClaseDto,
  EntradaListaEsperaResponseDto,
  EsperaConClaseResponseDto,
  InscribirClaseDto,
  InscripcionClaseResponseDto,
  InscripcionConClaseResponseDto,
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

  @Post()
  @RequiereRol('gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una clase en la agenda (RF-06, A4)',
    description:
      'El estado inicial es programada. La sede tiene que existir y estar activa. No hay DELETE: la baja es estado cancelada.',
  })
  @ApiCreatedResponse({ type: ClaseResponseDto })
  @ApiBadRequestResponse({
    description:
      'Texto vacío, horario inválido, capacidad no positiva o sede inactiva',
  })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  crear(@Body() body: CrearClaseDto) {
    return this.clasesService.crear(body);
  }

  @Patch(':id')
  @RequiereRol('gerente')
  @ApiOperation({
    summary: 'Editar una clase de la agenda (RF-06, A4)',
    description:
      'No cambia la sede. Cancelar pone estado cancelada, conserva las inscripciones y no avisa a la lista de espera. Se puede volver a programada. La capacidad no puede quedar bajo los lugares ya ocupados.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ClaseResponseDto })
  @ApiBadRequestResponse({
    description:
      'Body vacío, sedeId presente, horario inválido o capacidad bajo los lugares ocupados',
  })
  @ApiNotFoundResponse({ description: 'La clase solicitada no existe' })
  editar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: EditarClaseDto,
  ) {
    return this.clasesService.editar(id, body);
  }

  @Get('inscripciones/mias')
  @RequiereRol('socio')
  @ApiOperation({ summary: 'Listar las inscripciones a clases del socio autenticado' })
  @ApiOkResponse({ type: InscripcionConClaseResponseDto, isArray: true })
  listarMisInscripciones(@CurrentUser() user: AuthUserDto) {
    return this.clasesService.listarMisInscripciones(user.id);
  }

  @Post('inscripciones')
  @RequiereRol('socio')
  @ApiOperation({
    summary:
      'Inscribir al socio autenticado en una clase (RN-03 membresía vigente + D5 ventana 48 h)',
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

  @Get('lista-espera/mias')
  @RequiereRol('socio')
  @ApiOperation({
    summary: 'Listar los registros en lista de espera del socio autenticado (D7)',
  })
  @ApiOkResponse({ type: EsperaConClaseResponseDto, isArray: true })
  listarMiListaEspera(@CurrentUser() user: AuthUserDto) {
    return this.clasesService.listarMiListaEspera(user.id);
  }

  @Post('lista-espera')
  @RequiereRol('socio')
  @ApiOperation({
    summary:
      'Anotarse en la lista de espera de una clase sin cupo o con cola activa (RN-03 y D7)',
  })
  @ApiCreatedResponse({ type: EntradaListaEsperaResponseDto })
  @ApiBadRequestResponse({ description: 'claseId inválido o la clase ya comenzó' })
  @ApiForbiddenResponse({
    description: 'Rol no permitido o socio sin membresía activa vigente (RN-03)',
  })
  @ApiNotFoundResponse({ description: 'La clase solicitada no existe' })
  @ApiConflictResponse({
    description:
      'La clase tiene cupos disponibles sin lista de espera, está cancelada o el socio ya está inscripto/en espera',
  })
  anotarseEnListaEspera(
    @Body() dto: AnotarseListaEsperaDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.clasesService.anotarseEnListaEspera(dto?.claseId, user.id);
  }

  @Post('lista-espera/:id/confirmar')
  @HttpCode(HttpStatus.OK)
  @RequiereRol('socio')
  @ApiOperation({
    summary:
      'Confirmar dentro del plazo el lugar liberado en una clase (D7, invocado desde notificación in-app)',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'UUID del registro en lista_espera' })
  @ApiOkResponse({ type: InscripcionClaseResponseDto })
  @ApiBadRequestResponse({ description: 'ID con formato UUID inválido' })
  @ApiForbiddenResponse({
    description: 'El registro pertenece a otro usuario o la membresía no está vigente',
  })
  @ApiNotFoundResponse({ description: 'Registro en lista de espera inexistente' })
  @ApiConflictResponse({
    description: 'El lugar aún no fue notificado o venció el plazo de confirmación',
  })
  confirmarLugarEspera(
    @Param('id', ParseUUIDPipe) esperaId: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.clasesService.confirmarLugarEspera(esperaId, user.id);
  }

  @Delete('lista-espera/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiereRol('socio', 'admin_sede', 'gerente')
  @ApiOperation({
    summary:
      'Retirarse de la lista de espera (si tenía cupo notificado, promueve y avisa al siguiente por Observer)',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'UUID del registro en lista_espera' })
  @ApiNoContentResponse({ description: 'Retirado de la lista de espera correctamente' })
  @ApiBadRequestResponse({ description: 'ID inválido o registro ya procesado/vencido' })
  @ApiForbiddenResponse({
    description: 'Un socio no puede retirar a otro usuario de la lista de espera',
  })
  @ApiNotFoundResponse({ description: 'Registro en lista de espera inexistente' })
  retirarDeListaEspera(
    @Param('id', ParseUUIDPipe) esperaId: string,
    @CurrentUser() user: AuthUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clasesService.retirarDeListaEspera(esperaId, user.id, req.rol);
  }
}
