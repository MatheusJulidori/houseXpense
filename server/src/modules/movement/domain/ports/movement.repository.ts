import { Movement } from '../entities/movement';

export interface MovementRepository {
  save(movement: Movement): Promise<Movement>;
  findById(id: string, userId: string): Promise<Movement | null>;
  findAllByUser(userId: string, tagNames?: string[]): Promise<Movement[]>;
  delete(id: string, userId: string): Promise<void>;
}

export const MovementRepositoryToken = Symbol('MovementRepositoryToken');
