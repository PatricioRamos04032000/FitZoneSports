import { ConfigService } from '@nestjs/config';
import { TotpService, TOTP_PERIOD_SECONDS } from './totp.service';

/** Seed demo documentado (10 bytes tras base32). */
const SECRET = 'JBSWY3DPEHPK3PXP';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService({
      get: () => undefined,
    } as unknown as ConfigService);
  });

  it('genera un código de 6 dígitos', () => {
    const code = service.generarCodigoSync(SECRET);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('acepta el código del período actual', async () => {
    const code = service.generarCodigoSync(SECRET);
    await expect(service.verificar(SECRET, code)).resolves.toBe(true);
  });

  it('acepta código del período anterior (±1)', async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const prevEpoch = nowSec - TOTP_PERIOD_SECONDS;
    const { generateSync } = await import('otplib');
    const { createGuardrails } = await import('otplib');
    const codePrev = generateSync({
      secret: SECRET,
      period: TOTP_PERIOD_SECONDS,
      epoch: prevEpoch,
      guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
    });
    await expect(service.verificar(SECRET, codePrev)).resolves.toBe(true);
  });

  it('rechaza un código inventado', async () => {
    await expect(service.verificar(SECRET, '000000')).resolves.toBe(false);
  });

  it('secondsRemaining está entre 1 y period', () => {
    const rem = service.secondsRemaining();
    expect(rem).toBeGreaterThanOrEqual(1);
    expect(rem).toBeLessThanOrEqual(TOTP_PERIOD_SECONDS);
  });

  it('desencriptarSeedAlmacenado deja pasar plaintext', () => {
    expect(service.desencriptarSeedAlmacenado(SECRET)).toBe(SECRET);
  });

  it('roundtrip AES cuando hay clave', () => {
    const key = Buffer.alloc(32, 7).toString('base64');
    const withKey = new TotpService({
      get: (name: string) =>
        name === 'TOTP_SEED_ENCRYPTION_KEY' ? key : undefined,
    } as unknown as ConfigService);
    const stored = withKey.encriptarSeed(SECRET);
    expect(stored.startsWith('enc:v1:')).toBe(true);
    expect(withKey.desencriptarSeedAlmacenado(stored)).toBe(SECRET);
  });
});
