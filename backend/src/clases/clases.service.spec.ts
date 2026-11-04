import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MembresiasService } from '../membresias/membresias.service';
import {
  EsperaNotificada,
  ListaEsperaPublisher,
} from '../notificaciones/lista-espera.publisher';
import { RepositoryError } from '../supabase/repository.error';
import {
  Clase,
  ClaseConCupo,
  InscripcionClase,
  InscripcionConClase,
} from './clase.model';
import { ClasesRepository } from './clases.repository';
import { ClasesService, PLAZO_CONFIRMACION_ESPERA } from './clases.service';

const SEDE_ID = '42363e91-8c03-4d52-b160-5c1345be8656';
const CLASE_ID = 'c1000000-0000-4000-8000-000000000001';
const INSCRIPCION_ID = 'd1000000-0000-4000-8000-000000000001';
const SOCIO_A = 'a1000000-0000-4000-8000-000000000001';
const SOCIO_B = 'a1000000-0000-4000-8000-000000000002';
const ADMIN_SEDE = 'a1000000-0000-4000-8000-000000000009';

const AHORA = new Date('2026-11-10T12:00:00-03:00');

function crearClaseMock(inicioIso: string, estado: Clase['estado'] = 'programada'): Clase {
  return {
    id: CLASE_ID,
    sede_id: SEDE_ID,
    tipo: 'Spinning',
    instructor: 'Lucía Fernández',
    inicio: inicioIso,
    fin: '2026-11-13T19:00:00-03:00',
    capacidad_max: 20,
    estado,
    created_at: '2026-11-01T10:00:00Z',
  };
}

describe('ClasesService', () => {
  let service: ClasesService;
  let repo: {
    findConCupoPorSede: jest.Mock<Promise<ClaseConCupo[]>, [string]>;
    findById: jest.Mock<Promise<Clase | null>, [string]>;
    findInscripcionesPorPerfil: jest.Mock<Promise<InscripcionConClase[]>, [string]>;
    findInscripcionConClase: jest.Mock<Promise<InscripcionConClase | null>, [string]>;
    inscribir: jest.Mock<Promise<InscripcionClase>, [string, string]>;
    cancelar: jest.Mock<Promise<EsperaNotificada[]>, [string, boolean, string]>;
  };
  let membresias: {
    findActivaPorPerfil: jest.Mock<Promise<unknown>, [string, Date?]>;
  };
  let listaEspera: {
    notificarLugaresLiberados: jest.Mock<void, [unknown, EsperaNotificada[]]>;
  };

  beforeEach(() => {
    repo = {
      findConCupoPorSede: jest.fn(),
      findById: jest.fn(),
      findInscripcionesPorPerfil: jest.fn(),
      findInscripcionConClase: jest.fn(),
      inscribir: jest.fn(),
      cancelar: jest.fn().mockResolvedValue([]),
    };
    membresias = {
      findActivaPorPerfil: jest.fn().mockResolvedValue({ id: 'mem-1', estado: 'activo' }),
    };
    listaEspera = {
      notificarLugaresLiberados: jest.fn(),
    };

    service = new ClasesService(
      repo as unknown as ClasesRepository,
      membresias as unknown as MembresiasService,
      listaEspera as unknown as ListaEsperaPublisher,
    );
  });

  describe('inscribir (RN-03, D5 ventana 48 h y errores SQL)', () => {
    it('rechaza con 403 si el socio no posee membresía activa vigente (RN-03)', async () => {
      membresias.findActivaPorPerfil.mockRejectedValue(
        new NotFoundException('La membresía se encuentra vencida'),
      );

      await expect(
        service.inscribir(CLASE_ID, SOCIO_A, AHORA),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.inscribir).not.toHaveBeenCalled();
    });

    it('permite inscribirse cuando faltan 48 horas o más para el inicio (D5)', async () => {
      // Exactamente 49 horas después de AHORA
      repo.findById.mockResolvedValue(
        crearClaseMock('2026-11-12T13:00:00-03:00'),
      );
      const inscripcionMock: InscripcionClase = {
        id: INSCRIPCION_ID,
        clase_id: CLASE_ID,
        perfil_id: SOCIO_A,
        estado: 'inscripto',
        created_at: AHORA.toISOString(),
        cancelacion_tardia: false,
      };
      repo.inscribir.mockResolvedValue(inscripcionMock);

      const res = await service.inscribir(CLASE_ID, SOCIO_A, AHORA);

      expect(res).toEqual(inscripcionMock);
      expect(repo.inscribir).toHaveBeenCalledWith(CLASE_ID, SOCIO_A);
    });

    it('rechaza con 400 cuando faltan menos de 48 horas para el inicio (D5)', async () => {
      // 47 horas y 30 minutos después de AHORA
      repo.findById.mockResolvedValue(
        crearClaseMock('2026-11-12T11:30:00-03:00'),
      );

      await expect(
        service.inscribir(CLASE_ID, SOCIO_A, AHORA),
      ).rejects.toThrow(BadRequestException);
      expect(repo.inscribir).not.toHaveBeenCalled();
    });

    it.each([
      ['CLASE_NO_EXISTE', NotFoundException],
      ['CLASE_CANCELADA', ConflictException],
      ['CLASE_LLENA', ConflictException],
      ['HAY_LISTA_DE_ESPERA', ConflictException],
    ])('traduce el error SQL P0001 %s a su excepción HTTP correspondiente', async (mensajeSql, ExcepcionEsperada) => {
      repo.findById.mockResolvedValue(
        crearClaseMock('2026-11-13T12:00:00-03:00'),
      );
      repo.inscribir.mockRejectedValue(
        new RepositoryError(mensajeSql, 'P0001'),
      );

      await expect(
        service.inscribir(CLASE_ID, SOCIO_A, AHORA),
      ).rejects.toThrow(ExcepcionEsperada);
    });

    it('traduce inscripción duplicada (23505) a 409 ConflictException', async () => {
      repo.findById.mockResolvedValue(
        crearClaseMock('2026-11-13T12:00:00-03:00'),
      );
      repo.inscribir.mockRejectedValue(
        new RepositoryError('inscripciones_una_vigente', '23505'),
      );

      await expect(
        service.inscribir(CLASE_ID, SOCIO_A, AHORA),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelar (titularidad, D6 desde BD y Observer RF-08)', () => {
    it('impide con 403 que un socio cancele la inscripción de otro usuario', async () => {
      repo.findInscripcionConClase.mockResolvedValue({
        id: INSCRIPCION_ID,
        perfil_id: SOCIO_B,
        clase_id: CLASE_ID,
        estado: 'inscripto',
        clase: {
          id: CLASE_ID,
          sede_id: SEDE_ID,
          tipo: 'Spinning',
          inicio: '2026-11-11T18:00:00-03:00',
        },
      });

      await expect(
        service.cancelar(INSCRIPCION_ID, SOCIO_A, 'socio', AHORA),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.cancelar).not.toHaveBeenCalled();
    });

    it('permite a admin_sede cancelar la inscripción de un socio', async () => {
      repo.findInscripcionConClase.mockResolvedValue({
        id: INSCRIPCION_ID,
        perfil_id: SOCIO_B,
        clase_id: CLASE_ID,
        estado: 'inscripto',
        clase: {
          id: CLASE_ID,
          sede_id: SEDE_ID,
          tipo: 'Spinning',
          inicio: '2026-11-11T18:00:00-03:00',
        },
      });

      await service.cancelar(INSCRIPCION_ID, ADMIN_SEDE, 'admin_sede', AHORA);

      expect(repo.cancelar).toHaveBeenCalledWith(
        INSCRIPCION_ID,
        false,
        PLAZO_CONFIRMACION_ESPERA,
      );
    });

    it('calcula esTardia=false con más de 2 h y esTardia=true con menos de 2 h usando la fecha de la BD (D6), y publica notificados (RF-08)', async () => {
      const claseResumen = {
        id: CLASE_ID,
        sede_id: SEDE_ID,
        tipo: 'Yoga',
        inicio: '2026-11-10T15:00:00-03:00', // 3 horas después de AHORA (12:00)
      };
      repo.findInscripcionConClase.mockResolvedValue({
        id: INSCRIPCION_ID,
        perfil_id: SOCIO_A,
        clase_id: CLASE_ID,
        estado: 'inscripto',
        clase: claseResumen,
      });

      await service.cancelar(INSCRIPCION_ID, SOCIO_A, 'socio', AHORA);
      expect(repo.cancelar).toHaveBeenLastCalledWith(
        INSCRIPCION_ID,
        false,
        PLAZO_CONFIRMACION_ESPERA,
      );

      // Ahora faltan solo 45 minutos (14:15 -> inicio 15:00)
      const notificados: EsperaNotificada[] = [
        {
          id: 'e1000000-0000-4000-8000-000000000001',
          perfil_id: SOCIO_B,
          vence_en: '2026-11-10T14:45:00-03:00',
        },
      ];
      repo.cancelar.mockResolvedValueOnce(notificados);

      await service.cancelar(
        INSCRIPCION_ID,
        SOCIO_A,
        'socio',
        new Date('2026-11-10T14:15:00-03:00'),
      );

      expect(repo.cancelar).toHaveBeenLastCalledWith(
        INSCRIPCION_ID,
        true,
        PLAZO_CONFIRMACION_ESPERA,
      );
      expect(listaEspera.notificarLugaresLiberados).toHaveBeenLastCalledWith(
        claseResumen,
        notificados,
      );
    });
  });
});
