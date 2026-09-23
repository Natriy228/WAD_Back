import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan, MoreThanOrEqual } from 'typeorm';

import { Wave } from './entities/wave.entity'
import { MLike } from './entities/like.entity'

@Injectable()
export class WavesService {
  constructor(
      @InjectRepository(Wave)
      private waveRepository: Repository<Wave>,
      @InjectRepository(MLike)
      private likesRepository: Repository<MLike>
    ) {}

  async findAll(): Promise<Wave[]> {
    return this.waveRepository.find({ where: { status: "OK" } });
  }

  async findByID(requiredID: number) : Promise<Wave[]> {
    return this.waveRepository.find({ where: { status: "OK", id: requiredID } });
  }

  async findByWave(requireWave: number) : Promise<Wave[]> {
    return this.waveRepository.find({ where: { status: "OK", lowWave: LessThan(requireWave), highWave: MoreThanOrEqual(requireWave) } });
  }

  async getLikes(requireId: number) : Promise<MLike[]> {
    return this.likesRepository.find({ where: { wave: { id: requireId } } });
  }

  async findRedacting() : Promise<Wave[]> {
    return this.waveRepository.find({ where: { status: "draft" } });
  }

  async CUDraft(gname: string, gimg: string, gvideo: string) : Promise<void> {
    const curDrafts = await this.waveRepository.find({ where: { status: "draft" } });
    if (gname === "" || gimg === "" || gvideo === "" ) return;
    if (curDrafts.length === 0) {
        const allCards = await this.waveRepository.find({ where: { } });
        let newID = 1;
        for (let i = 0; i < allCards.length; ++i) {
          newID = Math.max(allCards[i].id);
        }
        newID += 1
        const newWave = await this.waveRepository.create({id: newID, status: "draft", name: gname, desc: "", lowWave: 0, highWave: 0, effClass: 0, img: gimg, video: gvideo});
        await this.waveRepository.save(newWave);
    }
    else {
        await this.waveRepository.update(curDrafts[0].id, {name: gname, img: gimg, video: gvideo});
    }
  }

  async PDraft(LW: number, HW: number, EC: number, DC: string) {
    const curDrafts = await this.waveRepository.find({ where: { status: "draft" } });
    if (DC === "") return;
    if (curDrafts.length === 0) return;
    await this.waveRepository.update(curDrafts[0].id, {status: "OK", desc: DC, lowWave: LW, highWave: HW, effClass: EC});
  }

  async DDraft(reqID: number) {
    await this.waveRepository.query("UPDATE waves SET status='del' WHERE id = $1 AND status <> 'del'", [reqID])
  }
}
