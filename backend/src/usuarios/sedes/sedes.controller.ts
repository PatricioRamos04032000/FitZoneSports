import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequiereRol } from '../../common/roles.decorator';
import { ActualizarSedeDto, CrearSedeDto, SedeDto } from './sede.dto';
import { SedesService } from './sedes.service';

@ApiTags('sedes')
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas las sedes, incluidas las inactivas' })
  @ApiOkResponse({ type: [SedeDto] })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar Supabase' })
  async findAll() {
    return this.sedesService.findAll();
  }

  @Post()
  @RequiereRol('gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Dar de alta una sede (A4, RNF-04)',
    description:
      'Una sede nueva es una fila: no hay deploy. El trigger de Postgres crea la configuración de horario pico.',
  })
  @ApiCreatedResponse({ type: SedeDto })
  @ApiBadRequestResponse({ description: 'Nombre vacío o aforo no positivo' })
  crear(@Body() body: CrearSedeDto) {
    return this.sedesService.crear(body);
  }

  @Patch(':id')
  @RequiereRol('gerente')
  @ApiOperation({
    summary: 'Editar una sede (A4, RNF-04)',
    description:
      'Cambia nombre, dirección, aforo o el flag activa. Desactivar no borra la sede ni sus canchas.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: SedeDto })
  @ApiBadRequestResponse({ description: 'Body vacío o datos inválidos' })
  @ApiNotFoundResponse({ description: 'La sede solicitada no existe' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarSedeDto,
  ) {
    return this.sedesService.actualizar(id, body);
  }
}
