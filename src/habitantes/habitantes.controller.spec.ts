import { Test, TestingModule } from '@nestjs/testing';
import { HabitantesController } from './habitantes.controller';

describe('HabitantesController', () => {
  let controller: HabitantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitantesController],
    }).compile();

    controller = module.get<HabitantesController>(HabitantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
