import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserOrmEntity } from '../../../auth/infrastructure/entities/user.orm-entity';
import { TagOrmEntity } from '../../../tag/infrastructure/entities/tag.orm-entity';
import { MovementType } from '../../domain/value-objects/movement-type';

@Entity('movements')
export class MovementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => UserOrmEntity, (user: UserOrmEntity) => user.movements)
  user: UserOrmEntity;

  @ManyToMany(() => TagOrmEntity, (tag: TagOrmEntity) => tag.movements)
  @JoinTable({
    name: 'movement_tags',
    joinColumn: { name: 'movement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
