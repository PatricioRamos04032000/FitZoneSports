import { Controller, Get } from '@nestjs/common';
import { SedesService } from './sedes.service';

@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Get()
  async findAll() {
    return this.sedesService.findAll();
  }
}