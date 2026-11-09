import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MembresiasService } from '../usuarios/membresias/membresias.service';
import { RepositoryError } from '../supabase/repository.error';
import { AccesoRepository } from './acceso.repository';
import { AccesoService } from './acceso.service';
import { TotpService } from './totp.service';

const SOCIO = 'socio-1';
const ADMIN = 'admin-1';
const SEDE = 'a1000000-0000-4000-8000-000000000001';

describe('AccesoService', () => {
  let service: AccesoService;
  let repository: jest.Mocked<AccesoRepository>;
  let totp: jest.Mocked<Pick<TotpService, 'verificar' | 'desencriptarSeedAlmacenado' | 'generarCodigo' | 'secondsRemaining' | 'puedeEmitirCifrado' | 'crearSecret' | 'encriptarSeed'>>;
  let membresias: { findActivaPorPerfil: jest.Mock };

  beforeEach(async () => {
    repository = {
      findTotpSeedActivo: jest.fn().mockResolvedValue({
        id: 'seed-1',
        perfil_id: SOCIO,
        seed_cifrado: 'JBSWY3DPEHPK3PXP',
        activo: true,
        rotado_en: null,
        created_at: new Date().toISOString(),
      }),
      upsertTotpSeed: jest.fn(),
      findCheckInByClientEventId: jest.fn().mockResolvedValue(null),
      registrarCheckIn: jest.fn().mockResolvedValue({
        id: 'ci-1',
        perfil_id: SOCIO,
        sede_id: SEDE,
        tipo: 'entrada',
        origen: 'online',
        ocurrio_en: new Date().toISOString(),
        client_event_id: null,
        created_at: new Date().toISOString(),
      }),
      registrarCheckOut: jest.fn(),
      listarPresenciasPorSede: jest.fn().mockResolvedValue([]),
      listarCheckInsPorSede: jest.fn().mockResolvedValue([]),
      findAforoMax: jest.fn().mockResolvedValue(50),
      esAdminDeSede: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<AccesoRepository>;

    totp = {
      verificar: jest.fn().mockResolvedValue(true),
      desencriptarSeedAlmacenado: jest.fn((s: string) => s),
      generarCodigo: jest.fn().mockResolvedValue('123456'),
      secondsRemaining: jest.fn().mockReturnValue(30),
      puedeEmitirCifrado: jest.fn().mockReturnValue(false),
      crearSecret: jest.fn(),
      encriptarSeed: jest.fn(),
    };

    membresias = {
      findActivaPorPerfil: jest.fn().mockResolvedValue({
        id: 'm-1',
        perfil_id: SOCIO,
        estado: 'activo',
        vigente_hasta: '2099-01-01',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccesoService,
        { provide: AccesoRepository, useValue: repository },
        { provide: TotpService, useValue: totp },
        { provide: MembresiasService, useValue: membresias },
      ],
    }).compile();

    service = module.get(AccesoService);
  });

  it('check-in feliz llama RPC tras membresía y TOTP', async () => {
    const result = await service.checkIn(
      { id: ADMIN, rol: 'admin_sede' },
      { perfilId: SOCIO, code: '123456', sedeId: SEDE },
    );
    expect(membresias.findActivaPorPerfil).toHaveBeenCalledWith(SOCIO);
    expect(totp.verificar).toHaveBeenCalled();
    expect(repository.registrarCheckIn).toHaveBeenCalledWith(
      expect.objectContaining({ perfilId: SOCIO, sedeId: SEDE }),
    );
    expect(result.tipo).toBe('entrada');
  });

  it('gerente no consulta admins_sede', async () => {
    await service.checkIn(
      { id: 'gerente-1', rol: 'gerente' },
      { perfilId: SOCIO, code: '123456', sedeId: SEDE },
    );
    expect(repository.esAdminDeSede).not.toHaveBeenCalled();
  });

  it('TOTP inválido → UnauthorizedException', async () => {
    totp.verificar.mockResolvedValue(false);
    await expect(
      service.checkIn(
        { id: ADMIN, rol: 'admin_sede' },
        { perfilId: SOCIO, code: '000000', sedeId: SEDE },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(repository.registrarCheckIn).not.toHaveBeenCalled();
  });

  it('membresía ausente → ForbiddenException MEMBRESIA_INACTIVA', async () => {
    const { NotFoundException } = await import('@nestjs/common');
    membresias.findActivaPorPerfil.mockRejectedValue(
      new NotFoundException('sin membresía'),
    );
    await expect(
      service.checkIn(
        { id: ADMIN, rol: 'admin_sede' },
        { perfilId: SOCIO, code: '123456', sedeId: SEDE },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('RPC YA_EN_OTRA_SEDE → ConflictException', async () => {
    repository.registrarCheckIn.mockRejectedValue(
      new RepositoryError('YA_EN_OTRA_SEDE', 'P0001'),
    );
    await expect(
      service.checkIn(
        { id: ADMIN, rol: 'admin_sede' },
        { perfilId: SOCIO, code: '123456', sedeId: SEDE },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('admin_sede sin asignación → ForbiddenException', async () => {
    repository.esAdminDeSede.mockResolvedValue(false);
    await expect(
      service.checkIn(
        { id: ADMIN, rol: 'admin_sede' },
        { perfilId: SOCIO, code: '123456', sedeId: SEDE },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('ensureTotpSeed no emite si ya hay seed activo', async () => {
    const r = await service.ensureTotpSeed(SOCIO);
    expect(r.emitido).toBe(false);
    expect(repository.upsertTotpSeed).not.toHaveBeenCalled();
  });

  it('ensureTotpSeed emite cifrado si no hay seed y hay key', async () => {
    repository.findTotpSeedActivo.mockResolvedValue(null);
    totp.puedeEmitirCifrado.mockReturnValue(true);
    totp.crearSecret.mockReturnValue('NEWSECRETBASE32AAAA');
    totp.encriptarSeed.mockReturnValue('enc:v1:iv:tag:data');
    repository.upsertTotpSeed.mockResolvedValue({
      id: 'seed-2',
      perfil_id: SOCIO,
      seed_cifrado: 'enc:v1:iv:tag:data',
      activo: true,
      rotado_en: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    const r = await service.ensureTotpSeed(SOCIO);
    expect(r.emitido).toBe(true);
    expect(repository.upsertTotpSeed).toHaveBeenCalledWith({
      perfilId: SOCIO,
      seedCifrado: 'enc:v1:iv:tag:data',
    });
  });

  const EVENT_OK = 'b1000000-0000-4000-8000-000000000001';
  const EVENT_FAIL = 'b1000000-0000-4000-8000-000000000002';
  const SOCIO_B = 'socio-2';

  it('sync: ítem ok + ítem YA_EN_OTRA_SEDE en el mismo batch', async () => {
    repository.registrarCheckIn
      .mockResolvedValueOnce({
        id: 'ci-sync-1',
        perfil_id: SOCIO,
        sede_id: SEDE,
        tipo: 'entrada',
        origen: 'offline_sync',
        ocurrio_en: new Date().toISOString(),
        client_event_id: EVENT_OK,
        created_at: new Date().toISOString(),
      })
      .mockRejectedValueOnce(
        new RepositoryError('YA_EN_OTRA_SEDE', 'P0001'),
      );

    const { results } = await service.syncCheckIns(
      { id: ADMIN, rol: 'admin_sede' },
      [
        {
          clientEventId: EVENT_OK,
          perfilId: SOCIO,
          code: '123456',
          sedeId: SEDE,
        },
        {
          clientEventId: EVENT_FAIL,
          perfilId: SOCIO_B,
          code: '123456',
          sedeId: SEDE,
        },
      ],
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      clientEventId: EVENT_OK,
      ok: true,
    });
    expect(results[0].checkIn?.origen).toBe('offline_sync');
    expect(results[1]).toMatchObject({
      clientEventId: EVENT_FAIL,
      ok: false,
      code: 'YA_EN_OTRA_SEDE',
    });
    expect(repository.registrarCheckIn).toHaveBeenCalledWith(
      expect.objectContaining({
        origen: 'offline_sync',
        clientEventId: EVENT_OK,
      }),
    );
  });

  it('sync: reintento con mismo clientEventId es ok sin revalidar TOTP', async () => {
    repository.findCheckInByClientEventId.mockResolvedValue({
      id: 'ci-prev',
      perfil_id: SOCIO,
      sede_id: SEDE,
      tipo: 'entrada',
      origen: 'offline_sync',
      ocurrio_en: new Date().toISOString(),
      client_event_id: EVENT_OK,
      created_at: new Date().toISOString(),
    });

    const { results } = await service.syncCheckIns(
      { id: ADMIN, rol: 'admin_sede' },
      [
        {
          clientEventId: EVENT_OK,
          perfilId: SOCIO,
          code: '000000',
          sedeId: SEDE,
        },
      ],
    );

    expect(results[0].ok).toBe(true);
    expect(results[0].checkIn?.id).toBe('ci-prev');
    expect(totp.verificar).not.toHaveBeenCalled();
    expect(repository.registrarCheckIn).not.toHaveBeenCalled();
  });

  it('sync: batch > 50 → BadRequestException', async () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      clientEventId: `b1000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      perfilId: SOCIO,
      code: '123456',
      sedeId: SEDE,
    }));
    await expect(
      service.syncCheckIns({ id: ADMIN, rol: 'admin_sede' }, items),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
