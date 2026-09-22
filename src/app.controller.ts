import { Controller, Get, Render, Param, Query } from '@nestjs/common';
import { WavesService } from './app.service';

@Controller()
export class WavesController {

  constructor(private readonly cardsService: WavesService) {}

  @Get('waves')
  @Render('tile')
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
  @Render('tape')
  getTilesById(@Param('id') id: string, @Query('next') next: boolean) {
    let curIDCard = this.cardsService.findByID(+id)
    let nextIDCard = this.cardsService.findByID(+id + 1)

    if (curIDCard === undefined) {
      return { foundCard: this.cardsService.findByID(1) }
    }

    if (next) {
      if (nextIDCard) {
        return { foundCard: nextIDCard }
      }
      else {
        return { foundCard: curIDCard }
      }
    }

    return { foundCard: curIDCard }
  }

  @Get('new')
  @Render('add')
  getCreatingTile() {
    return {
      foundCard: this.cardsService.findRedacting()
    }
  }
}
