import { Test, TestingModule } from '@nestjs/testing';
import { SedesService } from './sedes.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('SedesService', () => {
  let service: SedesService;

  beforeEach(async () => {
    const mockSupabaseService = {
      getClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SedesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SedesService>(SedesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});