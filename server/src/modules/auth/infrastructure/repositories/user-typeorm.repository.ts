import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class UserTypeormRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<{ id: string } | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id'],
    });
    return user ? { id: user.id } : null;
  }
}
