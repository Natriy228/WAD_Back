import { Controller, Get, Render, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(private readonly cardsService: AppService) {}

  @Get('tiles')
  @Render('tile')
  getTiles() {
    return {
      list: this.cardsService.findAll()
    }
  }

  @Get('tiles/:id')
  @Render('tape')
  getTilesById(@Param('id') id: string, @Query('next') next: boolean) {
    if (next) {
      if (this.cardsService.findByID(+id + 1)) {
        return {
          foundCard: this.cardsService.findByID(+id + 1)
        }
      }
    }
    return {
      foundCard: this.cardsService.findByID(+id)
    }
  }

  @Get('new')
  @Render('add')
  getCreatingTile() {
    return {
      foundCard: this.cardsService.findRedacting()
    }
  }
}
