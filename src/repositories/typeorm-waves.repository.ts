import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wave } from '../entities/wave.entity';

import { WaveFiltersDto } from '../dto/wave-filters.dto';

@Injectable()
export class TypeORMWavesRepository {
  constructor(
    @InjectRepository(Wave)
    private waveRepository: Repository<Wave>,
  ) {}

  async findAll(filters?: WaveFiltersDto): Promise<Wave[]> {
    const query = this.waveRepository.createQueryBuilder('waves');

    if (!filters?.includeDeleted) {
      query.where(`waves.status = 'OK'`);
    }

    if (filters?.reqFreq !== undefined) {
      query.andWhere('waves.lowWave <= :reqFreq AND waves.highWave > :reqFreq', { reqFreq: filters.reqFreq });
    }

    query.leftJoinAndSelect('waves.ownedUser', 'users');

    return await query.getMany();
  }

  async findById(id: number): Promise<Wave | null> {
    return await this.waveRepository.findOne({relations: { ownedUser: true },  where: { id } });
  }

  async findDraft(userID: number): Promise<Wave | null> {
    return await this.waveRepository.findOne({ where: { status: "draft", ownedUser: { id: userID } } });
  }

  async create(data: Partial<Wave>): Promise<Wave> {
    const product = this.waveRepository.create(data);
    return await this.waveRepository.save(product);
  }

  async publishDraft(userID: number): Promise<boolean> {
    const affected = await this.waveRepository.findOne({ where: { status: "draft", ownedUser: { id: userID } } });
    if (!affected) {
        return false;
    }

    await this.waveRepository.update(affected.id, { status: "OK" });
    return true;
  }

  async update(id: number, data: Partial<Wave>,): Promise<Wave> {
    await this.waveRepository.update(id, data);

    const updatedProduct = await this.findById(id);
    if (!updatedProduct) {
      throw new Error(`Product with id ${id} not found after update`);
    }

    return updatedProduct;
  }

  async softDelete(id: number): Promise<void> {
    await this.waveRepository.update(id, { status: "del" });
  }
}