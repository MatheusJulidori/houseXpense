import { NotFoundException } from '@nestjs/common';
import { MovementType } from '../../../domain/value-objects/movement-type';
import { Movement } from '../../../domain/entities/movement';
import type { MovementRepository } from '../../../domain/ports/movement.repository';
import { Tag } from '../../../../tag/domain/entities/tag';
import { TagService } from '../../../../tag/application/tag.service';
import { UpdateMovementUseCase } from '../update-movement.usecase';

const existingMovement = Movement.create({
  id: 'movement-1',
  type: MovementType.EXPENSE,
  date: new Date('2025-01-01'),
  description: 'Spotify Subscription',
  amount: 34.9,
  userId: 'user-1',
  tags: [{ id: 'tag-1', name: 'assinatura' }],
  createdAt: new Date('2025-01-01T12:00:00Z'),
});

describe('UpdateMovementUseCase', () => {
  let movementRepository: MovementRepository;
  let tagService: TagService;
  let save: jest.MockedFunction<MovementRepository['save']>;
  let findMovementById: jest.MockedFunction<MovementRepository['findById']>;
  let findAllByUser: jest.MockedFunction<MovementRepository['findAllByUser']>;
  let deleteMovement: jest.MockedFunction<MovementRepository['delete']>;
  let findOrCreate: jest.MockedFunction<TagService['findOrCreate']>;
  let sut: UpdateMovementUseCase;

  beforeEach(() => {
    save = jest.fn();
    findMovementById = jest.fn();
    findAllByUser = jest.fn();
    deleteMovement = jest.fn();
    movementRepository = {
      save,
      findById: findMovementById,
      findAllByUser,
      delete: deleteMovement,
    };

    findOrCreate = jest.fn();
    tagService = {
      findOrCreate,
    } as unknown as TagService;

    sut = new UpdateMovementUseCase(movementRepository, tagService);
  });

  it('updates movement data and persists changes', async () => {
    findMovementById.mockResolvedValue(existingMovement);
    const persisted = Movement.create({
      ...existingMovement.toJSON(),
      description: 'Netflix Subscription',
    });
    save.mockResolvedValue(persisted);

    const newTag = Tag.create({
      id: 'tag-2',
      name: 'Stream',
      userId: 'user-1',
      createdAt: new Date('2025-02-01T00:00:00Z'),
    });
    findOrCreate.mockResolvedValue([newTag]);

    const result = await sut.execute({
      id: 'movement-1',
      userId: 'user-1',
      description: 'Netflix Subscription',
      tags: ['Stream'],
    });

    expect(findOrCreate).toHaveBeenCalledWith(['Stream'], 'user-1');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Netflix Subscription',
      }),
    );
    expect(result).toBe(persisted);
  });

  it('throws when movement does not exist', async () => {
    findMovementById.mockResolvedValue(null);

    await expect(
      sut.execute({
        id: 'missing',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(save).not.toHaveBeenCalled();
  });
});
