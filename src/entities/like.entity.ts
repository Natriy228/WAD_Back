import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity'
import { Wave } from './wave.entity'

@Entity('likes')
export class MLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Wave, wave => wave.id)
  wave: Wave;
}