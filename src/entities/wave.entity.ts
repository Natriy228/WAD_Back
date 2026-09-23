import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('waves')
export class Wave {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  desc: string;

  @Column({ type: 'real' })
  lowWave: number;

  @Column({ type: 'real' })
  highWave: number;

  @Column({ type: 'smallint' })
  effClass: number;

  @Column({ type: 'varchar', length: 255 })
  img: string;

  @Column({ type: 'varchar', length: 255 })
  video: string;
}