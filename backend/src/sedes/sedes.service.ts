import { Injectable } from '@nestjs/common';
import { Sede } from './sede.model';
import { SedesRepository } from './sedes.repository';

@Injectable()
export class SedesService {
  constructor(private readonly sedesRepository: SedesRepository) {}

  findAll(): Promise<Sede[]> {
    return this.sedesRepository.findAll();
  }
}
