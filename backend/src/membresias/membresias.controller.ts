import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MembresiasService } from './membresias.service';
import { Membresia } from './membresia.model';

@Controller('membresias')
export class MembresiasController {
  constructor(private readonly membresiasService: MembresiasService) {}

  @Get()
  findAll() {
    return this.membresiasService.findAll();
  }

  @Get('activas/:perfilId')
  findActivaPorPerfil(@Param('perfilId') perfilId: string) {
    return this.membresiasService.findActivaPorPerfil(perfilId);
  }

  @Post()
  crear(@Body() membresiaData: Partial<Membresia>) {
    return this.membresiasService.crear(membresiaData);
  }
  
}