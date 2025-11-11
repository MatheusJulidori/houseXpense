import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementController } from './presentation/movement.controller';
import { MovementOrmEntity } from './infrastructure/entities/movement.orm-entity';
import { UserOrmEntity } from '../auth/infrastructure/entities/user.orm-entity';
import { TagOrmEntity } from '../tag/infrastructure/entities/tag.orm-entity';
import { TagModule } from '../tag/tag.module';
import { AuthModule } from '../auth/auth.module';
import { MovementTypeormRepository } from './infrastructure/repositories/movement-typeorm.repository';
import { MovementRepositoryToken } from './domain/ports/movement.repository';
import { CreateMovementUseCase } from './application/use-cases/create-movement.usecase';
import { GetMovementUseCase } from './application/use-cases/get-movement.usecase';
import { ListMovementsUseCase } from './application/use-cases/list-movements.usecase';
import { UpdateMovementUseCase } from './application/use-cases/update-movement.usecase';
import { DeleteMovementUseCase } from './application/use-cases/delete-movement.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovementOrmEntity, UserOrmEntity, TagOrmEntity]),
    TagModule,
    AuthModule,
  ],
  controllers: [MovementController],
  providers: [
    {
      provide: MovementRepositoryToken,
      useClass: MovementTypeormRepository,
    },
    MovementTypeormRepository,
    CreateMovementUseCase,
    GetMovementUseCase,
    ListMovementsUseCase,
    UpdateMovementUseCase,
    DeleteMovementUseCase,
  ],
})
export class MovementModule {}
