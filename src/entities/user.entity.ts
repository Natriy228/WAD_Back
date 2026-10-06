import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  nickName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  password: string;
}