import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class TypeORMUsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserById(userID: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userID } });
  }

  async register(newName: string, newPass: string) {
    const newUser = await this.userRepository.create({ nickName: newName, password: newPass });
    await this.userRepository.save(newUser);
  }
}