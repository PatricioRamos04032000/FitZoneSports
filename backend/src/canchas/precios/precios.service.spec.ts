import { Test, TestingModule } from '@nestjs/testing';
import { PreciosModule } from './precios.module';
import { PreciosService } from './precios.service';
import {
  CONFIGURACION_PICO_DEFAULT,
  ConfiguracionPico,
  ContextoPrecio,
  DESCUENTO_SOCIO_DEFAULT_PCT,
} from './pricing.strategy';
import { MemberDiscountPricing } from './strategies/member-discount-pricing.strategy';
import { PeakHourPricing } from './strategies/peak-hour-pricing.strategy';
import { StandardPricing } from './strategies/standard-pricing.strategy';

const PRECIO_BASE = 20_000;

// 2026-10-06 es martes (día ISO = 2)
const MARTES_17_HS = '2026-10-06T17:00:00-03:00';
const MARTES_18_HS = '2026-10-06T18:00:00-03:00';
const MARTES_19_HS = '2026-10-06T19:00:00-03:00';
const MARTES_20_HS = '2026-10-06T20:00:00-03:00';
const MARTES_21_HS = '2026-10-06T21:00:00-03:00';
const MARTES_22_HS = '2026-10-06T22:00:00-03:00';
// 2026-10-10 es sábado (día ISO = 6)
const SABADO_19_HS = '2026-10-10T19:00:00-03:00';

function crearContexto(overrides: Partial<ContextoPrecio> = {}): ContextoPrecio {
  return {
    precioBase: PRECIO_BASE,
    inicio: MARTES_17_HS,
    esSocioActivo: false,
    descuentoSocioPct: DESCUENTO_SOCIO_DEFAULT_PCT,
    pico: CONFIGURACION_PICO_DEFAULT,
    ...overrides,
  };
}

describe('Estrategias de precios individuales (S4-T01)', () => {
  describe('StandardPricing', () => {
    const strategy = new StandardPricing();

    it('siempre aplica y devuelve el precio base de la cancha', () => {
      const ctx = crearContexto({ precioBase: 25_000 });
      expect(strategy.aplica(ctx)).toBe(true);
      expect(strategy.calcular(0, ctx)).toBe(25_000);
    });
  });

  describe('PeakHourPricing', () => {
    const strategy = new PeakHourPricing();

    it('aplica dentro de la franja [desde, hasta) y no aplica en el límite superior', () => {
      expect(strategy.aplica(crearContexto({ inicio: MARTES_18_HS }))).toBe(false);
      expect(strategy.aplica(crearContexto({ inicio: MARTES_19_HS }))).toBe(true);
      expect(strategy.aplica(crearContexto({ inicio: MARTES_20_HS }))).toBe(true);
      expect(strategy.aplica(crearContexto({ inicio: MARTES_21_HS }))).toBe(false);
    });

    it('no aplica si el día no está en la lista de días pico de la sede', () => {
      const picoLunAVie: ConfiguracionPico = {
        recargoPct: 20,
        desde: '19:00',
        hasta: '21:00',
        dias: [1, 2, 3, 4, 5],
      };
      expect(
        strategy.aplica(crearContexto({ inicio: SABADO_19_HS, pico: picoLunAVie })),
      ).toBe(false);
    });

    it('incrementa el precio según el porcentaje configurado en la sede', () => {
      const ctx = crearContexto({ inicio: MARTES_19_HS });
      expect(strategy.calcular(20_000, ctx)).toBe(24_000);
    });
  });

  describe('MemberDiscountPricing', () => {
    const strategy = new MemberDiscountPricing();

    it('aplica solo si el socio está activo y tiene porcentaje mayor a cero (RN-03)', () => {
      expect(strategy.aplica(crearContexto({ esSocioActivo: true }))).toBe(true);
      expect(strategy.aplica(crearContexto({ esSocioActivo: false }))).toBe(false);
    });

    it('descuenta el porcentaje configurado para toda la cadena', () => {
      const ctx = crearContexto({ esSocioActivo: true, descuentoSocioPct: 15 });
      expect(strategy.calcular(20_000, ctx)).toBe(17_000);
    });
  });
});

describe('PreciosService — Casos de negocio S4-T09 (S4-T01)', () => {
  let service: PreciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PreciosModule],
    }).compile();

    service = module.get<PreciosService>(PreciosService);
  });

  describe('Tabla 1: configuración por defecto (descuento 15%, pico 20% 19:00–21:00 todos los días)', () => {
    it('Externo a las 17:00 paga tarifa estándar ($20.000)', () => {
      const resultado = service.calcular(
        crearContexto({ esSocioActivo: false, inicio: MARTES_17_HS }),
      );

      expect(resultado.precioFinal).toBe(20_000);
      expect(resultado.reglasAplicadas).toEqual(['StandardPricing']);
      expect(resultado.descuentoSocioAplicado).toBe(false);
    });

    it('Externo a las 19:00 paga tarifa estándar + recargo pico ($24.000)', () => {
      const resultado = service.calcular(
        crearContexto({ esSocioActivo: false, inicio: MARTES_19_HS }),
      );

      expect(resultado.precioFinal).toBe(24_000);
      expect(resultado.reglasAplicadas).toEqual([
        'StandardPricing',
        'PeakHourPricing',
      ]);
      expect(resultado.descuentoSocioAplicado).toBe(false);
    });

    it('Socio activo a las 17:00 recibe 15% de descuento ($17.000)', () => {
      const resultado = service.calcular(
        crearContexto({ esSocioActivo: true, inicio: MARTES_17_HS }),
      );

      expect(resultado.precioFinal).toBe(17_000);
      expect(resultado.reglasAplicadas).toEqual([
        'StandardPricing',
        'MemberDiscountPricing',
      ]);
      expect(resultado.descuentoSocioAplicado).toBe(true);
    });

    it('Socio activo a las 20:00 combina recargo pico y descuento socio: 20.000 × 1,20 × 0,85 = $20.400 (P4)', () => {
      const resultado = service.calcular(
        crearContexto({ esSocioActivo: true, inicio: MARTES_20_HS }),
      );

      expect(resultado.precioFinal).toBe(20_400);
      expect(resultado.reglasAplicadas).toEqual([
        'StandardPricing',
        'PeakHourPricing',
        'MemberDiscountPricing',
      ]);
      expect(resultado.descuentoSocioAplicado).toBe(true);
    });

    it('Socio con cuota vencida a las 19:00 paga como externo sin descuento ($24.000, RN-03)', () => {
      const resultado = service.calcular(
        crearContexto({ esSocioActivo: false, inicio: MARTES_19_HS }),
      );

      expect(resultado.precioFinal).toBe(24_000);
      expect(resultado.descuentoSocioAplicado).toBe(false);
      expect(resultado.reglasAplicadas).not.toContain('MemberDiscountPricing');
    });
  });

  describe('Tabla 2: sede configurada con 30% recargo, 18:00–22:00, lunes a viernes', () => {
    const picoSedePersonalizada: ConfiguracionPico = {
      recargoPct: 30,
      desde: '18:00',
      hasta: '22:00',
      dias: [1, 2, 3, 4, 5],
    };

    it('Externo martes 18:00 paga 20.000 × 1,30 = $26.000', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: false,
          inicio: MARTES_18_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(26_000);
    });

    it('Externo martes 22:00 está fuera del horario pico y paga $20.000', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: false,
          inicio: MARTES_22_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(20_000);
    });

    it('Socio activo martes 21:00 paga 20.000 × 1,30 × 0,85 = $22.100', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: true,
          inicio: MARTES_21_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(22_100);
    });
  });

  describe('Tabla 3: Gerente Central cambia descuento de socio a 10% (misma sede con 30% lun–vie)', () => {
    const picoSedePersonalizada: ConfiguracionPico = {
      recargoPct: 30,
      desde: '18:00',
      hasta: '22:00',
      dias: [1, 2, 3, 4, 5],
    };

    it('Socio activo martes 17:00 paga 20.000 × 0,90 = $18.000', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: true,
          descuentoSocioPct: 10,
          inicio: MARTES_17_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(18_000);
    });

    it('Socio activo martes 21:00 paga 20.000 × 1,30 × 0,90 = $23.400', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: true,
          descuentoSocioPct: 10,
          inicio: MARTES_21_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(23_400);
    });

    it('Externo sábado 19:00 no paga recargo porque sábado no aplica ($20.000)', () => {
      const resultado = service.calcular(
        crearContexto({
          esSocioActivo: false,
          descuentoSocioPct: 10,
          inicio: SABADO_19_HS,
          pico: picoSedePersonalizada,
        }),
      );

      expect(resultado.precioFinal).toBe(20_000);
    });
  });

  describe('Redondeo (P7)', () => {
    it('redondea al peso entero con Math.round después de aplicar todas las reglas', () => {
      // 15.555 * 1.15 = 17.888,25 -> 17.888
      const resultado = service.calcular(
        crearContexto({
          precioBase: 15_555,
          esSocioActivo: false,
          inicio: MARTES_19_HS,
          pico: { ...CONFIGURACION_PICO_DEFAULT, recargoPct: 15 },
        }),
      );

      expect(resultado.precioFinal).toBe(17_888);
    });
  });
});
