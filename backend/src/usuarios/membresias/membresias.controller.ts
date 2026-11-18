import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUserDto } from '../../common/auth-user.dto';
import { CurrentUser } from '../../common/current-user.decorator';
import { RequiereRol } from '../../common/roles.decorator';
import {
  CrearMembresiaDto,
  MembresiaResponseDto,
  PlanMembresiaResponseDto,
  RenovacionMembresiaResponseDto,
  RenovarMembresiaDto,
} from './membresia.dto';
import { MembresiasService } from './membresias.service';

@ApiTags('membresias')
@Controller('membresias')
export class MembresiasController {
  constructor(private readonly membresiasService: MembresiasService) {}

  @Get('planes')
  @ApiOperation({ summary: 'Listar catálogo de planes de membresía activos (D2)' })
  @ApiOkResponse({ type: PlanMembresiaResponseDto, isArray: true })
  listarPlanes() {
    return this.membresiasService.listarPlanes();
  }

  @Get('mia')
  @RequiereRol('socio')
  @ApiOperation({
    summary: 'Consultar la membresía del socio autenticado (identidad tomada del JWT)',
  })
  @ApiOkResponse({ type: MembresiaResponseDto })
  @ApiNotFoundResponse({ description: 'El socio no tiene membresías registradas' })
  obtenerMia(@CurrentUser() user: AuthUserDto) {
    return this.membresiasService.obtenerMia(user.id);
  }

  @Post('renovar')
  @RequiereRol('socio')
  @ApiOperation({
    summary:
      'Inicia el cobro de un plan del catálogo. La membresía vigente no cambia hasta que el pago se aprueba',
  })
  @ApiCreatedResponse({ type: RenovacionMembresiaResponseDto })
  @ApiBadRequestResponse({ description: 'Plan inválido o inactivo' })
  renovar(@CurrentUser() user: AuthUserDto, @Body() dto: RenovarMembresiaDto) {
    return this.membresiasService.iniciarRenovacion(user.id, dto?.plan);
  }

  @Get()
  @RequiereRol('admin_sede', 'gerente')
  @ApiOperation({ summary: 'Listar todas las membresías (recepción y gerencia)' })
  @ApiOkResponse({ type: MembresiaResponseDto, isArray: true })
  findAll() {
    return this.membresiasService.findAll();
  }

  @Get('activas/:perfilId')
  @RequiereRol('admin_sede', 'gerente')
  @ApiOperation({
    summary: 'Consultar la membresía activa y vigente de un socio (recepción y gerencia)',
  })
  @ApiParam({ name: 'perfilId', format: 'uuid' })
  @ApiOkResponse({ type: MembresiaResponseDto })
  @ApiBadRequestResponse({ description: 'perfilId con formato UUID inválido' })
  @ApiNotFoundResponse({ description: 'El socio no tiene membresía activa o está vencida' })
  findActivaPorPerfil(@Param('perfilId', ParseUUIDPipe) perfilId: string) {
    return this.membresiasService.findActivaPorPerfil(perfilId);
  }

  @Post()
  @RequiereRol('admin_sede', 'gerente')
  @ApiOperation({
    summary:
      'Dar de alta o renovar la membresía de un socio sin cobro. Cierra la activa anterior en la misma transacción',
  })
  @ApiCreatedResponse({ type: MembresiaResponseDto })
  @ApiBadRequestResponse({ description: 'perfil_id o plan inválidos' })
  @ApiNotFoundResponse({ description: 'El perfil indicado no existe' })
  @ApiConflictResponse({ description: 'Conflicto de concurrencia al crear la membresía' })
  crear(@Body() dto: CrearMembresiaDto) {
    return this.membresiasService.crear(dto);
  }
}
