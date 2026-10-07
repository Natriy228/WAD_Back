import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MLike } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { Wave } from '../entities/wave.entity';

@Injectable()
export class TypeORMLikesRepository {
  constructor(
    @InjectRepository(MLike)
    private likeRepository: Repository<MLike>,
  ) {}

  async findLikes(userID: number, waveID: number): Promise<number> {
    return (await this.likeRepository.find({ where: { user: { id: userID }, wave: { id: waveID } } })).length;
  }

  async discardLike(userID: number, waveID: number) : Promise<boolean> {
    const affected = await this.likeRepository.findOne({ where: { user: { id: userID }, wave: { id: waveID } } });
    if (!affected) return false;
    await this.likeRepository.delete(affected.id);
    return true;
  }

  async setLike(user: User, wave: Wave) {
    const newLike = await this.likeRepository.create({ user: user, wave: wave });
    await this.likeRepository.save(newLike);
  }
}