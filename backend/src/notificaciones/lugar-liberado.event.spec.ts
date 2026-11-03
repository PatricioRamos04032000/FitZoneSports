import { mensajeLugarLiberado } from './lugar-liberado.event';

describe('mensajeLugarLiberado', () => {
  it('arma el título y el mensaje con horarios de Argentina', () => {
    const { titulo, mensaje } = mensajeLugarLiberado({
      esperaId: 'e1',
      perfilId: 'p1',
      venceEn: '2026-10-07T19:30:00Z',
      clase: { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' },
    });

    expect(titulo).toBe('Se liberó un lugar en Spinning');
    expect(mensaje).toBe(
      'Hay un lugar para vos en Spinning (7/10, 18:00). Confirmalo antes de 7/10, 16:30; si no, pasa al siguiente de la lista.',
    );
  });
});
