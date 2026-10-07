import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from './user.entity'

@Entity('waves')
export class Wave {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'varchar', length: 50, default: "draft" })
  status: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  desc: string;

  @Column({ type: 'real' })
  lowWave: number;

  @Column({ type: 'real' })
  highWave: number;

  @Column({ type: 'varchar', length: 255, default: "" })
  img: string;

  @Column({ type: 'varchar', length: 255, default: "" })
  video: string;

  @ManyToOne(() => User, user => user.id)
  ownedUser: User;
}