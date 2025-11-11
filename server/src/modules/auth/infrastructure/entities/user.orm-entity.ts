import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { MovementOrmEntity } from '../../../movement/infrastructure/entities/movement.orm-entity';
import { TagOrmEntity } from '../../../tag/infrastructure/entities/tag.orm-entity';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => MovementOrmEntity,
    (movement: MovementOrmEntity) => movement.user,
  )
  movements: MovementOrmEntity[];

  @OneToMany(
    () => RefreshTokenOrmEntity,
    (token: RefreshTokenOrmEntity) => token.user,
  )
  refreshTokens: RefreshTokenOrmEntity[];

  @OneToMany(() => TagOrmEntity, (tag: TagOrmEntity) => tag.user)
  tags: TagOrmEntity[];
}
