import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './application/tag.service';
import { TagController } from './presentation/tag.controller';
import { TagRepositoryToken } from './domain/ports/tag.repository';
import { TagTypeormRepository } from './infrastructure/repositories/tag-typeorm.repository';
import { TagOrmEntity } from './infrastructure/entities/tag.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagOrmEntity])],
  controllers: [TagController],
  providers: [
    TagService,
    {
      provide: TagRepositoryToken,
      useClass: TagTypeormRepository,
    },
  ],
  exports: [TagService, TagRepositoryToken],
})
export class TagModule {}
