import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';

const SERVICE_KEY = 'service-role-key';
const ANON_KEY = 'anon-key';
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

const REGISTRO_OK = {
  email: 'nuevo@ejemplo.com',
  password: 'Prueba12345',
  dni: '30111222',
  nombre: 'Ana',
  apellido: 'Pérez',
};

describe('AuthService', () => {
  let supabase: SupabaseService;
  let service: AuthService;

  function crear() {
    const config = {
      get: (key: string) => {
        if (key === 'SUPABASE_URL') return 'https://proyecto.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return SERVICE_KEY;
        if (key === 'SUPABASE_ANON_KEY') return ANON_KEY;
        return undefined;
      },
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

  describe('register', () => {
    function mockSignupYPerfil(opts: {
      signUp?: { data: unknown; error: { message: string } | null };
      insertError?: { message: string; code?: string } | null;
      deleteUser?: jest.Mock;
    }) {
      const signUp = jest.fn().mockResolvedValue(
        opts.signUp ?? {
          data: {
            user: {
              id: 'nuevo-id',
              email: REGISTRO_OK.email,
              identities: [{ id: 'id1' }],
            },
            session: null,
          },
          error: null,
        },
      );
      const deleteUser = opts.deleteUser ?? jest.fn().mockResolvedValue({ data: null, error: null });
      const insert = jest.fn().mockResolvedValue({
        error: opts.insertError === undefined ? null : opts.insertError,
      });

      jest.spyOn(supabase, 'createSignupClient').mockReturnValue({
        auth: { signUp },
      } as never);
      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: () => ({ insert }),
        auth: { admin: { deleteUser } },
      } as never);

      return { signUp, insert, deleteUser };
    }

    it('rechaza email con formato inválido antes de llamar a Supabase', async () => {
      crear();
      const createSignup = jest.spyOn(supabase, 'createSignupClient');

      await expect(
        service.register({ ...REGISTRO_OK, email: 'no-es-mail' }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(createSignup).not.toHaveBeenCalled();
    });

    it('registra sin access_token y deja pendiente la confirmación', async () => {
      crear();
      const { signUp, insert } = mockSignupYPerfil({});

      await expect(service.register(REGISTRO_OK)).resolves.toEqual({
        user: { id: 'nuevo-id', email: 'nuevo@ejemplo.com' },
        message: 'Revisá tu email para confirmar la cuenta',
      });

      expect(signUp).toHaveBeenCalledWith({
        email: 'nuevo@ejemplo.com',
        password: 'Prueba12345',
      });
      expect(insert).toHaveBeenCalledWith({
        id: 'nuevo-id',
        rol: 'externo',
        dni: '30111222',
        nombre: 'Ana',
        apellido: 'Pérez',
        telefono: null,
      });
    });

    it('responde 409 si el email ya está registrado', async () => {
      crear();
      mockSignupYPerfil({
        signUp: {
          data: { user: null, session: null },
          error: { message: 'User already registered' },
        },
      });

      await expect(service.register(REGISTRO_OK)).rejects.toBeInstanceOf(ConflictException);
    });

    it('responde 409 si identities viene vacío (email existente)', async () => {
      crear();
      mockSignupYPerfil({
        signUp: {
          data: {
            user: { id: 'x', email: REGISTRO_OK.email, identities: [] },
            session: null,
          },
          error: null,
        },
      });

      await expect(service.register(REGISTRO_OK)).rejects.toBeInstanceOf(ConflictException);
    });

    it('si falla el perfil por DNI, borra el usuario Auth y responde 409', async () => {
      crear();
      const deleteUser = jest.fn().mockResolvedValue({ data: null, error: null });
      mockSignupYPerfil({
        insertError: { message: 'duplicate', code: '23505' },
        deleteUser,
      });

      await expect(service.register(REGISTRO_OK)).rejects.toBeInstanceOf(ConflictException);
      expect(deleteUser).toHaveBeenCalledWith('nuevo-id');
    });
  });
});
