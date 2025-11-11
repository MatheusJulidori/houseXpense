import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  MovementRepository,
  MovementRepositoryToken,
} from '../../domain/ports/movement.repository';
import { Movement } from '../../domain/entities/movement';

export interface GetMovementInput {
  id: string;
  userId: string;
}

@Injectable()
export class GetMovementUseCase {
  constructor(
    @Inject(MovementRepositoryToken)
    private readonly movementRepository: MovementRepository,
  ) {}

  async execute({ id, userId }: GetMovementInput): Promise<Movement> {
    const movement = await this.movementRepository.findById(id, userId);
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return movement;
  }
}
