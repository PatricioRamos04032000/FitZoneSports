import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PreciosModule } from './precios/precios.module';
import { CanchasRepository } from './canchas.repository';
import {
  ActorAutenticado,
  CanchasService,
  HORA_APERTURA_GRILLA,
  HORA_ULTIMO_TURNO_GRILLA,
} from './canchas.service';
import type {
  Cancha,
  ConfiguracionCadenaFila,
  ConfiguracionPicoFila,
  MantenimientoCancha,
  ReservaOcupacionFila,
} from './cancha.model';

const SEDE_CENTRAL_ID = 'a1000000-0000-4000-8000-000000000001';
const SEDE_NORTE_ID = 'a1000000-0000-4000-8000-000000000002';
const CANCHA_PADDLE_ID = 'a3000000-0000-4000-8000-000000000001';
const MANTENIMIENTO_ID = 'b4000000-0000-4000-8000-000000000001';
const GERENTE: ActorAutenticado = {
  id: '00000000-0000-0000-0000-000000000001',
  rol: 'gerente',
};
const ADMIN_SEDE: ActorAutenticado = {
  id: '00000000-0000-0000-0000-000000000002',
  rol: 'admin_sede',
};
const FECHA_PRUEBA = '2026-11-10'; // Martes (día ISO = 2)

const CANCHA_BASE: Cancha = {
  id: CANCHA_PADDLE_ID,
  sede_id: SEDE_CENTRAL_ID,
  tipo: 'paddle',
  nombre: 'Paddle 1',
  precio_hora: 20_000,
  activa: true,
  created_at: '2026-10-27T20:00:00.000Z',
};

const PICO_DEFAULT: ConfiguracionPicoFila = {
  sede_id: SEDE_CENTRAL_ID,
  recargo_pct: 20,
  desde: '19:00:00',
  hasta: '21:00:00',
  dias: [1, 2, 3, 4, 5, 6, 7],
};

const CADENA_DEFAULT: ConfiguracionCadenaFila = {
  id: true,
  descuento_socio_pct: 15,
  minutos_hold_reserva: 10,
};

describe('CanchasService (S4-T06)', () => {
  let service: CanchasService;
  const repo = {
    existeSede: jest.fn<Promise<boolean>, [string]>(),
    esAdminDeSede: jest.fn<Promise<boolean>, [string, string]>(),
    findBySede: jest.fn<Promise<Cancha[]>, [string, boolean?]>(),
    findById: jest.fn<Promise<Cancha | null>, [string]>(),
    crearCancha: jest.fn<Promise<Cancha>, [unknown]>(),
    actualizarCancha: jest.fn<Promise<Cancha | null>, [string, unknown]>(),
    findMantenimientosPorCancha: jest.fn<
      Promise<MantenimientoCancha[]>,
      [string]
    >(),
    findMantenimientosEnRango: jest.fn<
      Promise<MantenimientoCancha[]>,
      [string[], string, string]
    >(),
    crearMantenimiento: jest.fn<Promise<MantenimientoCancha>, [unknown]>(),
    findMantenimientoById: jest.fn<
      Promise<MantenimientoCancha | null>,
      [string]
    >(),
    eliminarMantenimiento: jest.fn<Promise<void>, [string]>(),
    findReservasActivasEnRango: jest.fn<
      Promise<ReservaOcupacionFila[]>,
      [string[], string, string]
    >(),
    findConfiguracionPico: jest.fn<
      Promise<ConfiguracionPicoFila | null>,
      [string]
    >(),
    upsertConfiguracionPico: jest.fn<
      Promise<ConfiguracionPicoFila>,
      [string, unknown]
    >(),
    findConfiguracionCadena: jest.fn<
      Promise<ConfiguracionCadenaFila | null>,
      []
    >(),
    actualizarDescuentoSocio: jest.fn<
      Promise<ConfiguracionCadenaFila>,
      [number]
    >(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repo.existeSede.mockResolvedValue(true);
    repo.esAdminDeSede.mockResolvedValue(true);
    repo.findBySede.mockResolvedValue([CANCHA_BASE]);
    repo.findById.mockResolvedValue(CANCHA_BASE);
    repo.findConfiguracionPico.mockResolvedValue(PICO_DEFAULT);
    repo.findConfiguracionCadena.mockResolvedValue(CADENA_DEFAULT);
    repo.findReservasActivasEnRango.mockResolvedValue([]);
    repo.findMantenimientosEnRango.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PreciosModule],
      providers: [
        CanchasService,
        { provide: CanchasRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(CanchasService);
  });

  describe('listarPorSede', () => {
    it('lista las canchas activas por defecto mapeadas a camelCase', async () => {
      const resultado = await service.listarPorSede(SEDE_CENTRAL_ID);

      expect(repo.findBySede).toHaveBeenCalledWith(SEDE_CENTRAL_ID, true);
      expect(resultado).toEqual([
        {
          id: CANCHA_PADDLE_ID,
          sedeId: SEDE_CENTRAL_ID,
          nombre: 'Paddle 1',
          tipo: 'paddle',
          precioHora: 20_000,
          activa: true,
          createdAt: CANCHA_BASE.created_at,
        },
      ]);
    });

    it('rechaza sedeId inválido con 400 y sede inexistente con 404', async () => {
      await expect(service.listarPorSede('no-es-uuid')).rejects.toThrow(
        BadRequestException,
      );

      repo.existeSede.mockResolvedValueOnce(false);
      await expect(service.listarPorSede(SEDE_CENTRAL_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('consultarDisponibilidad (RF-10, RF-11, RF-12, S7-T02b)', () => {
    it('arma turnos de 60 min en hora Argentina y calcula precios con Strategy', async () => {
      const ahoraIso = new Date().toISOString();
      const hace20MinIso = new Date(Date.now() - 20 * 60_000).toISOString();

      repo.findReservasActivasEnRango.mockResolvedValue([
        {
          id: 'res-confirmada',
          cancha_id: CANCHA_PADDLE_ID,
          inicio: `${FECHA_PRUEBA}T10:00:00-03:00`,
          fin: `${FECHA_PRUEBA}T11:00:00-03:00`,
          estado: 'confirmada',
          created_at: hace20MinIso,
        },
        {
          id: 'res-hold-vigente',
          cancha_id: CANCHA_PADDLE_ID,
          inicio: `${FECHA_PRUEBA}T11:00:00-03:00`,
          fin: `${FECHA_PRUEBA}T12:00:00-03:00`,
          estado: 'pendiente',
          created_at: ahoraIso,
        },
        {
          id: 'res-hold-vencido',
          cancha_id: CANCHA_PADDLE_ID,
          inicio: `${FECHA_PRUEBA}T12:00:00-03:00`,
          fin: `${FECHA_PRUEBA}T13:00:00-03:00`,
          estado: 'pendiente',
          created_at: hace20MinIso,
        },
      ]);

      repo.findMantenimientosEnRango.mockResolvedValue([
        {
          id: MANTENIMIENTO_ID,
          cancha_id: CANCHA_PADDLE_ID,
          desde: `${FECHA_PRUEBA}T15:00:00-03:00`,
          hasta: `${FECHA_PRUEBA}T17:00:00-03:00`,
          motivo: 'Pintura',
          created_at: ahoraIso,
        },
      ]);

      const grilla = await service.consultarDisponibilidad(
        SEDE_CENTRAL_ID,
        FECHA_PRUEBA,
      );

      expect(grilla.sedeId).toBe(SEDE_CENTRAL_ID);
      expect(grilla.descuentoSocioPct).toBe(15);
      expect(grilla.configuracionPico).toEqual({
        sedeId: SEDE_CENTRAL_ID,
        recargoPct: 20,
        desde: '19:00',
        hasta: '21:00',
        dias: [1, 2, 3, 4, 5, 6, 7],
      });

      const turnos = grilla.canchas[0].turnos;
      expect(turnos).toHaveLength(
        HORA_ULTIMO_TURNO_GRILLA - HORA_APERTURA_GRILLA + 1,
      );

      const porHora = new Map(turnos.map((t) => [t.hora, t]));
      expect(porHora.get('10:00')?.estado).toBe('ocupado');
      expect(porHora.get('11:00')?.estado).toBe('ocupado');
      // Hold pendiente vencido se muestra disponible (consistente con lazy cleanup en RPC)
      expect(porHora.get('12:00')?.estado).toBe('disponible');
      expect(porHora.get('15:00')?.estado).toBe('mantenimiento');
      expect(porHora.get('16:00')?.estado).toBe('mantenimiento');
      expect(porHora.get('17:00')).toMatchObject({
        estado: 'disponible',
        esHorarioPico: false,
        precioExterno: 20_000,
        precioSocio: 17_000,
      });
      expect(porHora.get('19:00')).toMatchObject({
        estado: 'disponible',
        esHorarioPico: true,
        precioExterno: 24_000,
        precioSocio: 20_400,
      });
    });

    it('valida fechas malformadas o inexistentes (ej. 2026-02-30) y config ausente', async () => {
      await expect(
        service.consultarDisponibilidad(SEDE_CENTRAL_ID, '10/11/2026'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.consultarDisponibilidad(SEDE_CENTRAL_ID, '2026-02-30'),
      ).rejects.toThrow(BadRequestException);

      repo.findConfiguracionPico.mockResolvedValueOnce(null);
      await expect(
        service.consultarDisponibilidad(SEDE_CENTRAL_ID, FECHA_PRUEBA),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('ABM y permisos por sede (RF-09, RF-12, S4-T09 P1/P3/P8)', () => {
    it('impide a un admin_sede operar sobre una sede no asignada (403 SEDE_NO_ASIGNADA)', async () => {
      repo.esAdminDeSede.mockResolvedValueOnce(false);

      await expect(
        service.crearCancha(ADMIN_SEDE, {
          sedeId: SEDE_NORTE_ID,
          nombre: 'Fútbol 5',
          tipo: 'futbol5',
          precioHora: 25_000,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(repo.crearCancha).not.toHaveBeenCalled();
    });

    it('permite al gerente crear y actualizar precio de cancha en cualquier sede', async () => {
      repo.crearCancha.mockResolvedValueOnce(CANCHA_BASE);
      const creada = await service.crearCancha(GERENTE, {
        sedeId: SEDE_CENTRAL_ID,
        nombre: '  Paddle 1  ',
        tipo: 'paddle',
        precioHora: 20_000,
      });
      expect(creada.nombre).toBe('Paddle 1');
      expect(repo.esAdminDeSede).not.toHaveBeenCalled();

      repo.actualizarCancha.mockResolvedValueOnce({
        ...CANCHA_BASE,
        precio_hora: 23_000,
      });
      const editada = await service.actualizarCancha(
        GERENTE,
        CANCHA_PADDLE_ID,
        { precioHora: 23_000 },
      );
      expect(editada.precioHora).toBe(23_000);
    });

    it('valida reglas al crear/eliminar mantenimientos (RF-12)', async () => {
      await expect(
        service.crearMantenimiento(ADMIN_SEDE, CANCHA_PADDLE_ID, {
          desde: '2026-11-15T18:00:00-03:00',
          hasta: '2026-11-15T14:00:00-03:00',
        }),
      ).rejects.toThrow(BadRequestException);

      const filaMant: MantenimientoCancha = {
        id: MANTENIMIENTO_ID,
        cancha_id: CANCHA_PADDLE_ID,
        desde: '2026-11-15T14:00:00-03:00',
        hasta: '2026-11-15T18:00:00-03:00',
        motivo: 'Red nueva',
        created_at: '2026-11-01T10:00:00.000Z',
      };
      repo.crearMantenimiento.mockResolvedValueOnce(filaMant);

      const creado = await service.crearMantenimiento(
        ADMIN_SEDE,
        CANCHA_PADDLE_ID,
        {
          desde: filaMant.desde,
          hasta: filaMant.hasta,
          motivo: '  Red nueva  ',
        },
      );
      expect(creado.motivo).toBe('Red nueva');

      repo.findMantenimientoById.mockResolvedValueOnce(filaMant);
      await service.eliminarMantenimiento(
        ADMIN_SEDE,
        CANCHA_PADDLE_ID,
        MANTENIMIENTO_ID,
      );
      expect(repo.eliminarMantenimiento).toHaveBeenCalledWith(MANTENIMIENTO_ID);
    });

    it('valida y actualiza configuracion_pico y descuento_socio_pct', async () => {
      await expect(
        service.actualizarConfiguracionPico(ADMIN_SEDE, SEDE_CENTRAL_ID, {
          recargoPct: 20,
          desde: '19:30',
          hasta: '21:00',
          dias: [1, 2],
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.actualizarConfiguracionPico(ADMIN_SEDE, SEDE_CENTRAL_ID, {
          recargoPct: 20,
          desde: '21:00',
          hasta: '19:00',
          dias: [1, 2],
        }),
      ).rejects.toThrow(BadRequestException);

      repo.upsertConfiguracionPico.mockResolvedValueOnce({
        sede_id: SEDE_CENTRAL_ID,
        recargo_pct: 30,
        desde: '18:00:00',
        hasta: '22:00:00',
        dias: [1, 2, 3, 4, 5],
      });

      const pico = await service.actualizarConfiguracionPico(
        ADMIN_SEDE,
        SEDE_CENTRAL_ID,
        {
          recargoPct: 30,
          desde: '18:00',
          hasta: '22:00',
          dias: [5, 1, 2, 2, 3, 4],
        },
      );
      expect(pico.dias).toEqual([1, 2, 3, 4, 5]);
      expect(repo.upsertConfiguracionPico).toHaveBeenCalledWith(
        SEDE_CENTRAL_ID,
        {
          recargo_pct: 30,
          desde: '18:00',
          hasta: '22:00',
          dias: [1, 2, 3, 4, 5],
        },
      );

      repo.actualizarDescuentoSocio.mockResolvedValueOnce({
        id: true,
        descuento_socio_pct: 10,
      });
      const desc = await service.actualizarDescuentoSocio({
        descuentoSocioPct: 10,
      });
      expect(desc.descuentoSocioPct).toBe(10);
    });
  });
});
