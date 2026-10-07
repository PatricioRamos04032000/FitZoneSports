
import { Controller, Get, Post, Delete, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { ClasesService } from './clases.service';

@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Get()
  findConCupoPorSede(@Query('sedeId') sedeId: string) {
    if (!sedeId) {
      throw new BadRequestException('Debe proporcionar el parámetro sedeId');
    }
    return this.clasesService.findConCupoPorSede(sedeId);
  }

  @Post('inscripciones')
  inscribir(@Body() data: { claseId: string; perfilId: string }) {
    return this.clasesService.inscribir(data.claseId, data.perfilId);
  }

  @Delete('inscripciones/:id')
  cancelar(
    @Param('id') inscripcionId: string, 
    @Body('inicioClase') inicioClase: string // Requerimos que el front mande la hora de inicio para calcular D6
  ) {
    return this.clasesService.cancelar(inscripcionId, inicioClase);
  }
}