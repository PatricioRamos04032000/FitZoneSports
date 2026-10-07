import { Injectable, NotFoundException } from '@nestjs/common';
import { MembresiasRepository } from './membresias.repository';
import { Membresia } from './membresia.model';

@Injectable()
export class MembresiasService {
  // El servicio le pide cosas al repositorio
  constructor(private readonly repository: MembresiasRepository) {}

  async findAll(): Promise<Membresia[]> {
    return this.repository.findAll();
  }

  async findActivaPorPerfil(perfilId: string): Promise<Membresia> {
    const membresia = await this.repository.findActivaPorPerfil(perfilId);
    
    if (!membresia) {
      throw new NotFoundException('El usuario no tiene una membresía activa');
    }

    // Regla D3: NestJS calcula si está vencida comparando fechas
    const fechaVencimiento = new Date(membresia.vigente_hasta);
    const hoy = new Date();

    if (fechaVencimiento < hoy) {
      throw new NotFoundException('La membresía se encuentra vencida');
    }

    return membresia;
  }
  
  // Método POST para crear una nueva membresía
  async crear(membresiaData: Partial<Membresia>): Promise<Membresia> {
    // Calculo de las fechas: arranca hoy
    const vigenteDesde = new Date();
    const vigenteHasta = new Date();
    
    // Si es mensual le sumamos 1 mes, si es trimestral 3, etc.
    if (membresiaData.plan === 'mensual') vigenteHasta.setMonth(vigenteHasta.getMonth() + 1);
    else if (membresiaData.plan === 'trimestral') vigenteHasta.setMonth(vigenteHasta.getMonth() + 3);
    else if (membresiaData.plan === 'anual') vigenteHasta.setFullYear(vigenteHasta.getFullYear() + 1);

    const nuevaMembresia = {
      ...membresiaData,
      estado: 'activo',
      vigente_desde: vigenteDesde.toISOString(),
      vigente_hasta: vigenteHasta.toISOString(),
    };

    // Usa el cliente expuesto del repositorio para insertar (from().insert())
    const { data, error } = await (this.repository as any).client
      .from('membresias')
      .insert([nuevaMembresia])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear la membresía en la base de datos: ${error.message}`);
    }

    return data;
  }
}