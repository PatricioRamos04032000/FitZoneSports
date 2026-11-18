import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { SedesController } from './sedes.controller';
import { SedesService } from './sedes.service';

describe('SedesController', () => {
  let controller: SedesController;

  beforeEach(async () => {
    const mockSedesService = {
      findAll: jest.fn(),
      crear: jest.fn(),
      actualizar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SedesController],
      providers: [
        {
          provide: SedesService,
          useValue: mockSedesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SedesController>(SedesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});