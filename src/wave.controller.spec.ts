import { Test, TestingModule } from '@nestjs/testing';
import { WavesController } from './wave.controller';
import { WavesService } from './wave.service';

describe('AppController', () => {
  let appController: WavesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WavesController],
      providers: [WavesService],
    }).compile();

    appController = app.get<WavesController>(WavesController);
  });
});
