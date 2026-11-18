import { Logger } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { ListaEsperaPublisher } from './lista-espera.publisher';
import { LugarLiberadoEvent } from './lugar-liberado.event';
import { NotificacionesRepository } from './notificaciones.repository';
import { EmailSimuladoObserver } from './observers/email-simulado.observer';
import { InAppObserver } from './observers/in-app.observer';
import { LogObserver } from './observers/log.observer';
import { PreferenciasRepository } from './preferencias.repository';

const clase = { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' };
const espera = { id: 'e1', perfil_id: 'p1', vence_en: '2026-10-07T19:30:00Z' };
const evento: LugarLiberadoEvent = {
  esperaId: 'e1',
  perfilId: 'p1',
  venceEn: '2026-10-07T19:30:00Z',
  clase,
};

/** Los observadores son `async: true`: corren después de que vuelve el publicador. */
async function esperarObservadores(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

describe('ListaEsperaPublisher', () => {
  let moduleRef: TestingModule;
  let publisher: ListaEsperaPublisher;
  let logError: jest.SpyInstance;
  let logLog: jest.SpyInstance;
  const notificaciones = { crear: jest.fn() };
  const preferencias = { findByPerfil: jest.fn(), findEmail: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    logLog = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    notificaciones.crear.mockResolvedValue({});
    preferencias.findByPerfil.mockResolvedValue({ notificar_por_email: true });
    preferencias.findEmail.mockResolvedValue('socio@fitzone.com');

    moduleRef = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        ListaEsperaPublisher,
        InAppObserver,
        LogObserver,
        EmailSimuladoObserver,
        { provide: NotificacionesRepository, useValue: notificaciones },
        { provide: PreferenciasRepository, useValue: preferencias },
      ],
    }).compile();
    await moduleRef.init();
    publisher = moduleRef.get(ListaEsperaPublisher);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('cada fila de lista_espera llega como evento a los tres observadores', async () => {
    publisher.notificarLugaresLiberados(clase, [espera]);
    await esperarObservadores();

    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ perfil_id: 'p1', tipo: 'lugar_liberado' }),
    );
    expect(logLog).toHaveBeenCalledWith(
      expect.stringContaining('Lugar liberado en clase c1 para perfil p1'),
    );
    expect(logLog).toHaveBeenCalledWith(
      expect.stringContaining('Para: socio@fitzone.com'),
    );
  });

  it('publica un evento por cada espera notificada', async () => {
    const update = jest.spyOn(moduleRef.get(InAppObserver), 'update');

    publisher.notificarLugaresLiberados(clase, [
      espera,
      { id: 'e2', perfil_id: 'p2', vence_en: '2026-10-07T19:30:00Z' },
    ]);
    await esperarObservadores();

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(evento);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ esperaId: 'e2', perfilId: 'p2' }),
    );
  });

  it('si un observador falla, los demás se ejecutan, el error se registra y el publicador no falla', async () => {
    notificaciones.crear.mockRejectedValue(new Error('sin conexión'));

    expect(() =>
      publisher.notificarLugaresLiberados(clase, [espera]),
    ).not.toThrow();
    await esperarObservadores();

    expect(logError).toHaveBeenCalledWith('sin conexión', expect.any(String));
    expect(logLog).toHaveBeenCalledWith(
      expect.stringContaining('Para: socio@fitzone.com'),
    );
  });
});
