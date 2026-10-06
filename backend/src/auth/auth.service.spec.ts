import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';

const SERVICE_KEY = 'service-role-key';
const USER_TOKEN = 'token-del-usuario';

function respuesta(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** Simula Supabase: login por /auth/v1/token y consultas por /rest/v1. */
function supabaseFalso(loginOk: boolean) {
  return jest.spyOn(global, 'fetch').mockImplementation((input) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes('/auth/v1/token')) {
      return Promise.resolve(
        loginOk
          ? respuesta(200, {
              access_token: USER_TOKEN,
              token_type: 'bearer',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              refresh_token: 'refresh',
              user: { id: 'u1', email: 'socio@fitzone.com', aud: 'authenticated' },
            })
          : respuesta(400, {
              code: 400,
              error_code: 'invalid_credentials',
              msg: 'Invalid login credentials',
            }),
      );
    }
    return Promise.resolve(respuesta(200, []));
  });
}

function authorizationDeLaConsulta(fetchSpy: jest.SpyInstance): string | null {
  const llamada = fetchSpy.mock.calls.find(([input]) =>
    String(input instanceof Request ? input.url : input).includes('/rest/v1/sedes'),
  );
  const [input, init] = llamada as [RequestInfo, RequestInit | undefined];
  const headers = input instanceof Request ? input.headers : new Headers(init?.headers);
  return headers.get('Authorization');
}

describe('AuthService', () => {
  let supabase: SupabaseService;
  let service: AuthService;

  function crear() {
    const config = {
      get: (key: string) =>
        key === 'SUPABASE_URL' ? 'https://proyecto.supabase.co' : SERVICE_KEY,
    } as unknown as ConfigService;
    supabase = new SupabaseService(config);
    service = new AuthService(supabase);
  }

  afterEach(() => jest.restoreAllMocks());

  it('devuelve el token y el usuario de Supabase', async () => {
    supabaseFalso(true);
    crear();

    await expect(service.login('socio@fitzone.com', 'clave')).resolves.toMatchObject({
      access_token: USER_TOKEN,
      user: { id: 'u1', email: 'socio@fitzone.com' },
    });
  });

  it('responde 401 con credenciales inválidas', async () => {
    supabaseFalso(false);
    crear();

    await expect(service.login('socio@fitzone.com', 'mala')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('el login no cambia la sesión del cliente compartido del backend', async () => {
    const fetchSpy = supabaseFalso(true);
    crear();

    await service.login('socio@fitzone.com', 'clave');
    await supabase.getClient().from('sedes').select('*');

    expect(authorizationDeLaConsulta(fetchSpy)).toBe(`Bearer ${SERVICE_KEY}`);
  });
});
