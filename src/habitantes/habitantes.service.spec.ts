import { Test, TestingModule } from '@nestjs/testing';
import { HabitantesService } from './habitantes.service';

describe('HabitantesService', () => {
  let service: HabitantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitantesService],
    }).compile();

    service = module.get<HabitantesService>(HabitantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
