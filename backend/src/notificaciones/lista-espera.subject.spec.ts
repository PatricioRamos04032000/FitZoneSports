import { Logger } from '@nestjs/common';
import { ListaEsperaSubject } from './lista-espera.subject';
import { LugarLiberadoEvent } from './lugar-liberado.event';
import { Observer } from './observer';

const evento: LugarLiberadoEvent = {
  esperaId: 'e1',
  perfilId: 'p1',
  venceEn: '2026-10-07T19:30:00Z',
  clase: { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' },
};

function observer(): Observer<LugarLiberadoEvent> & { update: jest.Mock } {
  return { update: jest.fn().mockResolvedValue(undefined) };
}

describe('ListaEsperaSubject', () => {
  let subject: ListaEsperaSubject;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    subject = new ListaEsperaSubject();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  it('notifica el evento a todos los observadores suscriptos', async () => {
    const a = observer();
    const b = observer();
    subject.attach(a);
    subject.attach(b);

    await subject.notify(evento);

    expect(a.update).toHaveBeenCalledWith(evento);
    expect(b.update).toHaveBeenCalledWith(evento);
  });

  it('no notifica a un observador desuscripto', async () => {
    const a = observer();
    subject.attach(a);
    subject.detach(a);

    await subject.notify(evento);

    expect(a.update).not.toHaveBeenCalled();
  });

  it('si un observador falla, los demás se notifican igual y se registra el error', async () => {
    const falla = observer();
    falla.update.mockRejectedValue(new Error('sin conexión'));
    const ok = observer();
    subject.attach(falla);
    subject.attach(ok);

    await expect(subject.notify(evento)).resolves.toBeUndefined();

    expect(ok.update).toHaveBeenCalledWith(evento);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('falló para la espera e1: Error: sin conexión'),
    );
  });

  it('convierte las filas de lista_espera en eventos', async () => {
    const a = observer();
    subject.attach(a);

    await subject.notificarLugaresLiberados(
      { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' },
      [{ id: 'e1', perfil_id: 'p1', vence_en: '2026-10-07T19:30:00Z' }],
    );

    expect(a.update).toHaveBeenCalledWith(evento);
  });
});
