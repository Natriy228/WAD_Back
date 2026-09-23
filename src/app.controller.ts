import { Controller, Get, Render, Param, Query, Post, Redirect, Body } from '@nestjs/common';
import { WavesService } from './app.service';



@Controller()
export class WavesController {

  constructor(private readonly cardsService: WavesService) {}

  @Get('waves')
  @Render('tile')
  async getTiles(@Query('waveLength') reqWave: number) {
    if (reqWave) {
      const reqList = await this.cardsService.findByWave(reqWave)
      return { list: reqList }
    }

    const list = await this.cardsService.findAll();
    return { list }
  }

  @Get('waves/:id')
  @Render('tape')
  async getTilesById(@Param('id') id: string, @Query('next') next: boolean) {
    const curIDCard = await this.cardsService.findByID(+id)
    const nextIDCard = await this.cardsService.findByID(+id + 1)
    const firstCard = await this.cardsService.findByID(1)

    let likesCount = 0

    if (curIDCard.length === 0) {
      likesCount = (await this.cardsService.getLikes(1)).length;
      return { foundCard: firstCard[0], likes: likesCount }
    }

    if (next) {
      if (nextIDCard.length != 0) {
        likesCount = (await this.cardsService.getLikes(+id + 1)).length;
        return { foundCard: nextIDCard[0], likes: likesCount }
      }
      else {
        likesCount = (await this.cardsService.getLikes(1)).length;
        return { foundCard: firstCard[0], likes: likesCount }
      }
    }

    likesCount = (await this.cardsService.getLikes(+id)).length;
    return { foundCard: curIDCard[0], likes: likesCount }
  }

  @Get('new')
  @Render('add')
  async getCreatingTile() {
    const redactingCard = await this.cardsService.findRedacting()
    if (redactingCard.length != 0) {
      return { foundCard: redactingCard[0] }
    }
  }

  @Post('save-draft')
  @Redirect('/new', 302)
  async loadDraft(@Body('name') name: string, @Body('img') img: string, @Body('vid') vid: string) {
    if (name == undefined || img == undefined || vid == undefined) return;
    await this.cardsService.CUDraft(name, img, vid);
  }

  @Post('public-draft')
  @Redirect('/waves', 302)
  async publicDraft(@Body('LW') LW: string, @Body('HW') HW: string, @Body('EC') EC: string, @Body('desc') desc: string) {
    if (LW == undefined || HW == undefined || EC == undefined || desc == undefined) return;
    await this.cardsService.PDraft(+LW, +HW, +EC, desc);
  }

  @Post('delete-card')
  @Redirect('/waves', 302)
  async deleteDraft(@Body('reqID') reqID: string) {
    await this.cardsService.DDraft(+reqID);
  }
}
