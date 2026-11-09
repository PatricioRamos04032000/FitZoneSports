import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SedeDto } from './sede.dto';
import { SedesService } from './sedes.service';

@ApiTags('sedes')
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas las sedes' })
  @ApiOkResponse({ type: [SedeDto] })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar Supabase' })
  async findAll() {
    return this.sedesService.findAll();
  }
}
