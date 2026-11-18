import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AccesoService } from '../../acceso/acceso.service';
import { PagosRepository } from '../../pagos/pagos.repository';
import { PasarelaPago } from '../../pagos/pasarela-pago';
import { RepositoryError } from '../../supabase/repository.error';
import { Membresia, PlanMembresiaFila } from './membresia.model';
import { MembresiasRepository } from './membresias.repository';
import {
  MembresiasService,
  fechaHoyArgentina,
  sumarMesesFechaIso,
} from './membresias.service';

const PERFIL_SOCIO = 'a1000000-0000-4000-8000-000000000001';
const MEMBRESIA_ID = 'b1000000-0000-4000-8000-000000000001';

describe('MembresiasService', () => {
  let service: MembresiasService;
  let repo: {
    findAll: jest.Mock<Promise<Membresia[]>, []>;
    findActivaPorPerfil: jest.Mock<Promise<Membresia | null>, [string]>;
    findUltimaPorPerfil: jest.Mock<Promise<Membresia | null>, [string]>;
    findPlanesActivos: jest.Mock<Promise<PlanMembresiaFila[]>, []>;
    findPlanActivo: jest.Mock<Promise<PlanMembresiaFila | null>, [string]>;
    renovar: jest.Mock<Promise<Membresia>, [string, string]>;
  };
  let acceso: {
    ensureTotpSeed: jest.Mock<Promise<void>, [string]>;
  };
  let pagos: {
    actualizarEstado: jest.Mock;
    aprobarMembresia: jest.Mock;
  };
  let pasarela: {
    crearPreferencia: jest.Mock;
  };

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findActivaPorPerfil: jest.fn(),
      findUltimaPorPerfil: jest.fn(),
      findPlanesActivos: jest.fn(),
      findPlanActivo: jest.fn(),
      renovar: jest.fn(),
    };
    acceso = {
      ensureTotpSeed: jest.fn().mockResolvedValue(undefined),
    };
    pagos = {
      actualizarEstado: jest.fn().mockResolvedValue({}),
      aprobarMembresia: jest.fn().mockResolvedValue({}),
    };
    pasarela = {
      crearPreferencia: jest.fn().mockResolvedValue({
        pagoId: 'pago-1',
        checkoutUrl: 'http://localhost:3000/pasarela-simulada/checkout/pago-1',
      }),
    };

    service = new MembresiasService(
      repo as unknown as MembresiasRepository,
      acceso as unknown as AccesoService,
      pagos as unknown as PagosRepository,
      pasarela as unknown as PasarelaPago,
    );
  });

  describe('helpers de fechas en hora Argentina', () => {
    it('mantiene la fecha del día en Argentina después de las 21:00 (cuando UTC ya es mañana)', () => {
      // 2026-10-31 23:30 en Argentina = 2026-11-01 02:30Z
      const nocheArgentina = new Date('2026-10-31T23:30:00-03:00');
      expect(fechaHoyArgentina(nocheArgentina)).toBe('2026-10-31');
    });

    it('ajusta fin de mes al sumar meses calendario (31 de enero + 1 mes = 28 de febrero)', () => {
      expect(sumarMesesFechaIso('2026-01-31', 1)).toBe('2026-02-28');
      expect(sumarMesesFechaIso('2026-11-04', 3)).toBe('2027-02-04');
      expect(sumarMesesFechaIso('2026-11-04', 12)).toBe('2027-11-04');
    });
  });

  describe('findActivaPorPerfil y obtenerMia (D3 y zona horaria)', () => {
    const membresia31Oct: Membresia = {
      id: MEMBRESIA_ID,
      perfil_id: PERFIL_SOCIO,
      plan: 'mensual',
      estado: 'activo',
      vigente_desde: '2026-10-01',
      vigente_hasta: '2026-10-31',
    };

    it('considera vigente la membresía durante todo su último día en Argentina (incluso a las 23:30)', async () => {
      repo.findActivaPorPerfil.mockResolvedValue(membresia31Oct);
      const ultimoDiaNoche = new Date('2026-10-31T23:30:00-03:00');

      const activa = await service.findActivaPorPerfil(
        PERFIL_SOCIO,
        ultimoDiaNoche,
      );
      const mia = await service.obtenerMia(PERFIL_SOCIO, ultimoDiaNoche);

      expect(activa.estado).toBe('activo');
      expect(mia.estado).toBe('activo');
    });

    it('al día siguiente marca vencida: findActivaPorPerfil lanza 404 y obtenerMia calcula estado vencido (D3)', async () => {
      repo.findActivaPorPerfil.mockResolvedValue(membresia31Oct);
      const diaSiguiente = new Date('2026-11-01T00:05:00-03:00');

      await expect(
        service.findActivaPorPerfil(PERFIL_SOCIO, diaSiguiente),
      ).rejects.toThrow(NotFoundException);

      const mia = await service.obtenerMia(PERFIL_SOCIO, diaSiguiente);
      expect(mia).toEqual({
        ...membresia31Oct,
        estado: 'vencido',
      });
    });
  });

  describe('crear (D1, D2 y sanitización del body)', () => {
    it('delega el cierre y el alta en renovar_membresia y asegura seed TOTP', async () => {
      repo.findPlanActivo.mockResolvedValue({
        plan: 'trimestral',
        duracion_meses: 3,
        precio: 67500,
        activo: true,
      });
      const insertada: Membresia = {
        id: MEMBRESIA_ID,
        perfil_id: PERFIL_SOCIO,
        plan: 'trimestral',
        estado: 'activo',
        vigente_desde: '2026-10-31',
        vigente_hasta: '2027-01-31',
      };
      repo.renovar.mockResolvedValue(insertada);

      const payloadConExtras = {
        perfil_id: PERFIL_SOCIO,
        plan: 'trimestral' as const,
        estado: 'suspendido',
        vigente_hasta: '2099-12-31',
      };

      const resultado = await service.crear(payloadConExtras);

      expect(repo.renovar).toHaveBeenCalledWith(PERFIL_SOCIO, 'trimestral');
      expect(acceso.ensureTotpSeed).toHaveBeenCalledWith(PERFIL_SOCIO);
      expect(resultado).toEqual(insertada);
    });

    it('responde 400 si el plan no está activo y no llama a la función', async () => {
      repo.findPlanActivo.mockResolvedValue(null);

      await expect(
        service.crear({ perfil_id: PERFIL_SOCIO, plan: 'mensual' }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.renovar).not.toHaveBeenCalled();
    });

    it('responde 400 si el plan no es válido', async () => {
      await expect(
        service.crear({
          perfil_id: PERFIL_SOCIO,
          plan: 'semanal' as never,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.renovar).not.toHaveBeenCalled();
    });

    it('responde 400 si perfil_id no es un UUID válido', async () => {
      await expect(
        service.crear({
          perfil_id: 'no-es-uuid',
          plan: 'mensual',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('traduce colisión concurrente 23505 a 409 ConflictException', async () => {
      repo.findPlanActivo.mockResolvedValue({
        plan: 'mensual',
        duracion_meses: 1,
        precio: 25000,
        activo: true,
      });
      repo.renovar.mockRejectedValue(
        new RepositoryError('duplicate key', '23505'),
      );

      await expect(
        service.crear({ perfil_id: PERFIL_SOCIO, plan: 'mensual' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('renovación cobrada', () => {
    const insertada: Membresia = {
      id: MEMBRESIA_ID,
      perfil_id: PERFIL_SOCIO,
      plan: 'mensual',
      estado: 'activo',
      vigente_desde: '2026-11-14',
      vigente_hasta: '2026-12-14',
    };

    it('un plan inactivo no abre el checkout', async () => {
      repo.findPlanActivo.mockResolvedValue(null);

      await expect(
        service.iniciarRenovacion(PERFIL_SOCIO, 'mensual'),
      ).rejects.toThrow(BadRequestException);
      expect(pasarela.crearPreferencia).not.toHaveBeenCalled();
    });

    it('arma un pago pendiente con el precio del catálogo', async () => {
      repo.findPlanActivo.mockResolvedValue({
        plan: 'mensual',
        duracion_meses: 1,
        precio: 25000,
        activo: true,
      });

      const resultado = await service.iniciarRenovacion(PERFIL_SOCIO, 'mensual');

      expect(pasarela.crearPreferencia).toHaveBeenCalledWith({
        monto: 25000,
        concepto: 'membresia',
        referenciaId: PERFIL_SOCIO,
        perfilId: PERFIL_SOCIO,
        plan: 'mensual',
      });
      expect(resultado.checkoutUrl).toContain('/pasarela-simulada/checkout/');
      expect(repo.renovar).not.toHaveBeenCalled();
    });

    it('un pago rechazado no cierra la membresía vigente', async () => {
      await service.aplicarResultadoPago(
        { id: 'pago-1', perfil_id: PERFIL_SOCIO, plan: 'mensual' },
        false,
      );

      expect(pagos.actualizarEstado).toHaveBeenCalledWith('pago-1', {
        estado: 'rechazado',
        token_pasarela: null,
      });
      expect(repo.renovar).not.toHaveBeenCalled();
      expect(pagos.aprobarMembresia).not.toHaveBeenCalled();
    });

    it('un pago aprobado cierra la anterior y vincula la nueva', async () => {
      repo.renovar.mockResolvedValue(insertada);

      await service.aplicarResultadoPago(
        { id: 'pago-1', perfil_id: PERFIL_SOCIO, plan: 'mensual' },
        true,
        'sim-token',
      );

      expect(repo.renovar).toHaveBeenCalledWith(PERFIL_SOCIO, 'mensual');
      expect(pagos.aprobarMembresia).toHaveBeenCalledWith(
        'pago-1',
        MEMBRESIA_ID,
        'sim-token',
      );
      expect(acceso.ensureTotpSeed).toHaveBeenCalledWith(PERFIL_SOCIO);
    });
  });
});
