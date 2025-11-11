import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  MovementRepository,
  MovementRepositoryToken,
} from '../../domain/ports/movement.repository';

export interface DeleteMovementInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteMovementUseCase {
  constructor(
    @Inject(MovementRepositoryToken)
    private readonly movementRepository: MovementRepository,
  ) {}

  async execute({ id, userId }: DeleteMovementInput): Promise<void> {
    const existing = await this.movementRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundException('Movement not found');
    }

    await this.movementRepository.delete(id, userId);
  }
}
