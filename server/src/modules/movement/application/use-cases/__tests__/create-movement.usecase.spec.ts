import { NotFoundException } from '@nestjs/common';
import { Movement } from '../../../domain/entities/movement';
import { MovementType } from '../../../domain/value-objects/movement-type';
import { CreateMovementUseCase } from '../create-movement.usecase';
import type { MovementRepository } from '../../../domain/ports/movement.repository';
import type { UserRepository } from '../../../../auth/domain/ports/user.repository';
import { Tag } from '../../../../tag/domain/entities/tag';
import { TagService } from '../../../../tag/application/tag.service';

const buildMovement = () =>
  Movement.create({
    id: 'movement-1',
    type: MovementType.EXPENSE,
    date: new Date('2025-01-01'),
    description: 'Spotify Subscription',
    amount: 34.9,
    userId: 'user-1',
    tags: [{ id: 'tag-1', name: 'assinatura' }],
    createdAt: new Date('2025-01-02T10:00:00Z'),
  });

describe('CreateMovementUseCase', () => {
  let movementRepository: MovementRepository;
  let tagService: TagService;
  let userRepository: UserRepository;
  let save: jest.MockedFunction<MovementRepository['save']>;
  let findById: jest.MockedFunction<UserRepository['findById']>;
  let findOrCreate: jest.MockedFunction<TagService['findOrCreate']>;
  let findAllByUser: jest.MockedFunction<MovementRepository['findAllByUser']>;
  let findMovementById: jest.MockedFunction<MovementRepository['findById']>;
  let deleteMovement: jest.MockedFunction<MovementRepository['delete']>;
  let sut: CreateMovementUseCase;

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

    findById = jest.fn();
    userRepository = {
      findById,
    };

    sut = new CreateMovementUseCase(
      movementRepository,
      tagService,
      userRepository,
    );
  });

  it('creates a movement with normalized date and tags', async () => {
    const persistedMovement = buildMovement();
    save.mockResolvedValue(persistedMovement);
    findById.mockResolvedValue({ id: 'user-1' });

    const tag = Tag.create({
      id: 'tag-1',
      name: 'Assinatura',
      userId: 'user-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    });
    findOrCreate.mockResolvedValue([tag]);

    const result = await sut.execute({
      userId: 'user-1',
      description: 'Spotify Subscription',
      type: MovementType.EXPENSE,
      amount: 34.9,
      tags: ['Assinatura'],
      date: '2025-01-01',
    });

    expect(findById).toHaveBeenCalledWith('user-1');
    expect(findOrCreate).toHaveBeenCalledWith(['Assinatura'], 'user-1');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        description: 'Spotify Subscription',
        amount: 34.9,
      }),
    );
    expect(result).toBe(persistedMovement);
  });

  it('throws when user is not found', async () => {
    findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        userId: 'missing-user',
        description: 'Spotify Subscription',
        type: MovementType.EXPENSE,
        amount: 34.9,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(save).not.toHaveBeenCalled();
  });
});
