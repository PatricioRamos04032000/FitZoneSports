import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import {
  createGuardrails,
  generate,
  generateSecret,
  generateSync,
  verify,
} from 'otplib';

/** Prefijo de seeds cifrados con AES-256-GCM (Fase 2). */
export const TOTP_ENC_PREFIX = 'enc:v1:';

/** Período TOTP del plan M2 (ADR-007). */
export const TOTP_PERIOD_SECONDS = 60;

/**
 * Ventana ±1 período en segundos (epochTolerance simétrico de otplib).
 * Con period=60, 60 s de holgura = un step hacia atrás y adelante.
 */
export const TOTP_EPOCH_TOLERANCE_SECONDS = 60;

/** El seed demo `JBSWY3DPEHPK3PXP` decodifica a 10 bytes; otplib exige ≥16 por defecto. */
const DEMO_COMPAT_GUARDRAILS = createGuardrails({ MIN_SECRET_BYTES: 10 });

@Injectable()
export class TotpService {
  constructor(private readonly config: ConfigService) {}

  /** Genera un secreto base32 nuevo (para emitir / rotar). */
  crearSecret(): string {
    return generateSecret();
  }

  async generarCodigo(secretBase32: string): Promise<string> {
    return generate({
      secret: secretBase32,
      period: TOTP_PERIOD_SECONDS,
      guardrails: DEMO_COMPAT_GUARDRAILS,
    });
  }

  /** Sync para tests unitarios. */
  generarCodigoSync(secretBase32: string): string {
    return generateSync({
      secret: secretBase32,
      period: TOTP_PERIOD_SECONDS,
      guardrails: DEMO_COMPAT_GUARDRAILS,
    });
  }

  async verificar(
    secretBase32: string,
    token: string,
    epochSeconds?: number,
  ): Promise<boolean> {
    const result = await verify({
      secret: secretBase32,
      token: token.trim(),
      period: TOTP_PERIOD_SECONDS,
      epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS,
      guardrails: DEMO_COMPAT_GUARDRAILS,
      ...(epochSeconds !== undefined ? { epoch: epochSeconds } : {}),
    });
    return result.valid;
  }

  secondsRemaining(nowMs = Date.now()): number {
    const elapsed = Math.floor(nowMs / 1000) % TOTP_PERIOD_SECONDS;
    return TOTP_PERIOD_SECONDS - elapsed;
  }

  /**
   * Lee `seed_cifrado` de BD: plaintext base32 (seed demo) o `enc:v1:iv:tag:cipher`.
   */
  desencriptarSeedAlmacenado(seedCifrado: string): string {
    if (!seedCifrado.startsWith(TOTP_ENC_PREFIX)) {
      return seedCifrado;
    }

    const key = this.encryptionKeyOrThrow();
    const payload = seedCifrado.slice(TOTP_ENC_PREFIX.length);
    const [ivB64, tagB64, dataB64] = payload.split(':');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new ServiceUnavailableException('Formato de seed TOTP inválido');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);
    return plain.toString('utf8');
  }

  /**
   * Cifra un secreto base32 para persistir. Requiere `TOTP_SEED_ENCRYPTION_KEY`.
   */
  encriptarSeed(secretBase32: string): string {
    const key = this.encryptionKeyOrThrow();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(secretBase32, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${TOTP_ENC_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  puedeEmitirCifrado(): boolean {
    return Boolean(this.config.get<string>('TOTP_SEED_ENCRYPTION_KEY')?.trim());
  }

  private encryptionKeyOrThrow(): Buffer {
    const raw = this.config.get<string>('TOTP_SEED_ENCRYPTION_KEY')?.trim();
    if (!raw) {
      throw new ServiceUnavailableException(
        'Falta TOTP_SEED_ENCRYPTION_KEY para cifrar/desencriptar seeds',
      );
    }
    const key = Buffer.from(raw, 'base64');
    if (key.length !== 32) {
      throw new ServiceUnavailableException(
        'TOTP_SEED_ENCRYPTION_KEY debe ser 32 bytes en base64',
      );
    }
    return key;
  }
}
