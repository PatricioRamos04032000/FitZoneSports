import { Logger } from '@nestjs/common';
import { LugarLiberadoEvent } from '../lugar-liberado.event';
import { NotificacionesRepository } from '../notificaciones.repository';
import { PreferenciasRepository } from '../preferencias.repository';
import { EmailSimuladoObserver } from './email-simulado.observer';
import { InAppObserver } from './in-app.observer';

const evento: LugarLiberadoEvent = {
  esperaId: 'e1',
  perfilId: 'p1',
  venceEn: '2026-10-07T19:30:00Z',
  clase: { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' },
};

describe('InAppObserver', () => {
  it('guarda la notificación con los ids para confirmar el lugar', async () => {
    const repo = { crear: jest.fn().mockResolvedValue({}) };

    await new InAppObserver(repo as unknown as NotificacionesRepository).update(
      evento,
    );

    expect(repo.crear).toHaveBeenCalledWith({
      perfil_id: 'p1',
      tipo: 'lugar_liberado',
      titulo: 'Se liberó un lugar en Spinning',
      mensaje: expect.stringContaining('Confirmalo antes de 7/10, 16:30'),
      datos: { espera_id: 'e1', clase_id: 'c1', vence_en: '2026-10-07T19:30:00Z' },
    });
  });
});

describe('EmailSimuladoObserver', () => {
  const preferencias = { findByPerfil: jest.fn(), findEmail: jest.fn() };
  const observer = new EmailSimuladoObserver(
    preferencias as unknown as PreferenciasRepository,
  );
  let logLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logLog = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  it('no envía nada si el socio no lo activó', async () => {
    preferencias.findByPerfil.mockResolvedValue({ notificar_por_email: false });

    await observer.update(evento);

    expect(preferencias.findEmail).not.toHaveBeenCalled();
    expect(logLog).not.toHaveBeenCalled();
  });

  it('registra el email simulado si el socio lo activó', async () => {
    preferencias.findByPerfil.mockResolvedValue({ notificar_por_email: true });
    preferencias.findEmail.mockResolvedValue('socio@fitzone.com');

    await observer.update(evento);

    expect(logLog).toHaveBeenCalledWith(
      expect.stringContaining('Para: socio@fitzone.com | Asunto: Se liberó un lugar en Spinning'),
    );
  });

  it('no falla si el usuario no tiene email', async () => {
    preferencias.findByPerfil.mockResolvedValue({ notificar_por_email: true });
    preferencias.findEmail.mockResolvedValue(undefined);

    await expect(observer.update(evento)).resolves.toBeUndefined();
    expect(logLog).not.toHaveBeenCalled();
  });
});
