import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ClasesRepository } from './clases.repository';
import { ClaseConCupo, InscripcionClase } from './clase.model';
import { RepositoryError } from '../supabase/repository.error';

@Injectable()
export class ClasesService {
  constructor(private readonly repository: ClasesRepository) {}

  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    return this.repository.findConCupoPorSede(sedeId);
  }

  // Método POST para reservar un lugar directamente
  async inscribir(claseId: string, perfilId: string): Promise<InscripcionClase> {
    try {
      return await this.repository.inscribir(claseId, perfilId);
    } catch (e) {

      // Manejo de errores de negocio desde SQL a HTTP (Plantilla S3-T11)
      if (e instanceof RepositoryError && e.code === 'P0001') {
        switch (e.message) {
          case 'CLASE_NO_EXISTE': 
            throw new NotFoundException('La clase solicitada no existe');
          case 'CLASE_CANCELADA': 
            throw new ConflictException('La clase ha sido cancelada y no admite reservas');
          case 'CLASE_LLENA': 
            throw new ConflictException('La clase ya alcanzó su capacidad máxima');
          case 'HAY_LISTA_DE_ESPERA': 
            throw new ConflictException('La clase tiene lista de espera activa. Debes anotarte allí.');
        }
      }
      throw e; // Si no es un error controlado, el filtro global de Nest devuelve un 500
    }
  }

  // Método para cancelar una inscripción
  async cancelar(inscripcionId: string, inicioClase: string): Promise<void> {
    
    // Decisión D6: Cancelación tardía si falta menos de 2 horas para el inicio
    const fechaInicio = new Date(inicioClase);
    const limiteTardia = new Date(fechaInicio.getTime() - 2 * 60 * 60 * 1000);
    const hoy = new Date();
    const esTardia = hoy > limiteTardia;

    // Decisión D7: Plazo que tiene el siguiente en la lista para confirmar su lugar
    const plazoConfirmacion = '30 minutes'; 

    try {
      await this.repository.cancelar(inscripcionId, esTardia, plazoConfirmacion);
    } catch (e) {
      if (e instanceof RepositoryError && e.code === 'P0001') {
        switch (e.message) {
          case 'INSCRIPCION_NO_EXISTE': 
            throw new NotFoundException('La inscripción no fue encontrada');
          case 'INSCRIPCION_NO_VIGENTE': 
            throw new BadRequestException('La inscripción ya se encontraba cancelada o vencida');
        }
      }
      throw e;
    }
  }
}