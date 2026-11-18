import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequiereRol } from '../common/roles.decorator';
import { ResumenReporteDto } from './reporte.dto';
import { ReportesService } from './reportes.service';

@ApiTags('reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  @RequiereRol('gerente')
  @ApiOperation({
    summary: 'Resumen de la cadena para el gerente (A4)',
    description:
      'Solo lectura. Ocupación actual, reservas del día y clases del día por sede, más el total de la cadena. El día es el de America/Argentina/Buenos_Aires.',
  })
  @ApiOkResponse({ type: ResumenReporteDto })
  resumen() {
    return this.reportesService.resumen();
  }
}
