import {
  Movement,
  type MovementProps,
} from '../../../src/modules/movement/domain/entities/movement';
import {
  MovementType,
} from '../../../src/modules/movement/domain/value-objects/movement-type';

const buildMovementProps = (overrides: Partial<MovementProps> = {}): MovementProps => ({
  id: 'movement-1',
  type: MovementType.EXPENSE,
  date: new Date('2025-01-01'),
  description: 'Spotify Subscription',
  amount: 34.9,
  userId: 'user-1',
  tagIds: ['tag-1', 'tag-2'],
  createdAt: new Date('2025-01-02T10:00:00Z'),
  ...overrides,
});

describe('Movement Domain Entity', () => {
  it('creates a valid movement and exposes immutable data', () => {
    const movement = Movement.create(buildMovementProps());

    expect(movement.id).toBe('movement-1');
    expect(movement.amount).toBe(34.9);
    expect(movement.tagIds).toEqual(['tag-1', 'tag-2']);

    const snapshot = movement.toJSON();
    expect(snapshot).toMatchObject({
      id: 'movement-1',
      type: MovementType.EXPENSE,
      userId: 'user-1',
    });
    expect(snapshot.tagIds).not.toBe(movement.tagIds);
  });

  it('normalizes immutable updates via helper methods', () => {
    const movement = Movement.create(buildMovementProps());

    const updated = movement
      .withDescription('  New Description ')
      .withAmount(100)
      .withTags(['tag-2', 'tag-3', 'tag-3', '']);

    expect(updated.description).toBe('New Description');
    expect(updated.amount).toBe(100);
    expect(updated.tagIds).toEqual(['tag-2', 'tag-3']);
  });

  it('rejects invalid movement data', () => {
    expect(() =>
      Movement.create(
        buildMovementProps({
          amount: -1,
        }),
      ),
    ).toThrow('Movement amount must be a positive number');

    expect(() =>
      Movement.create(
        buildMovementProps({
          description: '',
        }),
      ),
    ).toThrow('Movement description is required');

    expect(() =>
      Movement.create(
        buildMovementProps({
          type: 'UNKNOWN' as MovementType,
        }),
      ),
    ).toThrow('Invalid movement type');
  });
});

