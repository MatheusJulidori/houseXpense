import { Injectable, Inject } from '@nestjs/common';
import {
  MovementRepository,
  MovementRepositoryToken,
} from '../../domain/ports/movement.repository';
import { Movement } from '../../domain/entities/movement';

export interface ListMovementsInput {
  userId: string;
  tags?: string[];
}

@Injectable()
export class ListMovementsUseCase {
  constructor(
    @Inject(MovementRepositoryToken)
    private readonly movementRepository: MovementRepository,
  ) {}

  async execute(input: ListMovementsInput): Promise<Movement[]> {
    const tags =
      input.tags && input.tags.length > 0
        ? input.tags.map((tag) => tag.toLowerCase())
        : undefined;

    return this.movementRepository.findAllByUser(input.userId, tags);
  }
}
