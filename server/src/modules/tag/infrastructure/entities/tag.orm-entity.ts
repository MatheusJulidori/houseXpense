import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { MovementOrmEntity } from '../../../movement/infrastructure/entities/movement.orm-entity';
import { UserOrmEntity } from '../../../auth/infrastructure/entities/user.orm-entity';

@Entity('tags')
@Unique('uq_tags_user_id_name', ['userId', 'name'])
@Index('idx_tags_user_id', ['userId'])
export class TagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

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
