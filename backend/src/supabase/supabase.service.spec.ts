import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { ConfigService } from '@nestjs/config';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    // Le pasamos una URL con formato válido (https://...) para que 
    // la librería de Supabase no crashee al hacer la validación interna.
    const mockConfigService = {
      get: jest.fn().mockReturnValue('https://falsa-url-de-prueba.supabase.co'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createAuthClient devuelve un cliente nuevo, distinto del compartido', () => {
    const authClient = service.createAuthClient();

    expect(authClient).not.toBe(service.getClient());
    expect(service.createAuthClient()).not.toBe(authClient);
  });
});