import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { MovementOrmEntity } from '../../../movement/infrastructure/entities/movement.orm-entity';

@Entity('tags')
export class TagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToMany(
    () => MovementOrmEntity,
    (movement: MovementOrmEntity) => movement.tags,
  )
  @JoinTable({
    name: 'movement_tags',
    joinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'movement_id', referencedColumnName: 'id' },
  })
  movements: MovementOrmEntity[];
}
