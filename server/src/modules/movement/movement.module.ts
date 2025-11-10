import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { Movement } from '../../entities/movement.entity';
import { User } from '../../entities/user.entity';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, User]), TagModule],
  controllers: [MovementController],
  providers: [MovementService],
  exports: [MovementService],
})
export class MovementModule {}
