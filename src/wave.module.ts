import { Module } from '@nestjs/common';
import { WavesController } from './wave.controller';
import { WavesService } from './wave.service';

@Module({
  imports: [],
  controllers: [WavesController],
  providers: [WavesService],
})
export class AppModule {}
