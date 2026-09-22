import { Module } from '@nestjs/common';
import { WavesController } from './app.controller';
import { WavesService } from './app.service';

@Module({
  imports: [],
  controllers: [WavesController],
  providers: [WavesService],
})
export class AppModule {}
