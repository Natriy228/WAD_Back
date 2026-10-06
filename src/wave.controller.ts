import { Controller, Get, Render, Param, Query } from '@nestjs/common';
import { WavesService } from './wave.service';

@Controller()
export class WavesController {

  constructor(private readonly cardsService: WavesService) {}

  @Get('waves')
  @Render('wavesTile')
  getTiles(@Query('waveLength') reqWave: number) {
    if (reqWave) {
      return {
        list: this.cardsService.findByWave(reqWave)
      }
    }
    return {
      list: this.cardsService.findAll()
    }
  }

  @Get('waves/:id')
  @Render('wavesTape')
  getTilesById(@Param('id') id: string, @Query('next') next: boolean) {
    let curIDCard = this.cardsService.findByID(+id)
    let nextIDCard = this.cardsService.findByID(+id + 1)

    if (curIDCard[0] === undefined) {
      const waveData = this.cardsService.findByID(1);
      return { foundCard: waveData[0], likes: waveData[1] }
    }

    if (next) {
      if (nextIDCard[0]) {
        return { foundCard: nextIDCard[0], likes: nextIDCard[1] }
      }
      else {
        return { foundCard: curIDCard[0], likes: curIDCard[1] }
      }
    }

    return { foundCard: curIDCard[0], likes: curIDCard[1] }
  }

  @Get('newWave')
  @Render('waveAdd')
  getCreatingTile() {
    return {
      foundCard: this.cardsService.findRedacting()
    }
  }
}
