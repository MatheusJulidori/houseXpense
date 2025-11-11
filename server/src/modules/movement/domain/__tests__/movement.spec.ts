import { Movement, type MovementProps } from '../entities/movement';
import { MovementType } from '../value-objects/movement-type';

const buildMovementProps = (
  overrides: Partial<MovementProps> = {},
): MovementProps => ({
  id: 'movement-1',
  type: MovementType.EXPENSE,
  date: new Date('2025-01-01'),
  description: 'Spotify Subscription',
  amount: 34.9,
  userId: 'user-1',
  tags: [
    { id: 'tag-1', name: 'assinatura' },
    { id: 'tag-2', name: 'luxo' },
  ],
  createdAt: new Date('2025-01-02T10:00:00Z'),
  ...overrides,
});

describe('Movement Domain Entity', () => {
  it('creates a valid movement and exposes immutable data', () => {
    const movement = Movement.create(buildMovementProps());

    expect(movement.id).toBe('movement-1');
    expect(movement.amount).toBe(34.9);
    expect(movement.tags).toEqual([
      { id: 'tag-1', name: 'assinatura' },
      { id: 'tag-2', name: 'luxo' },
    ]);

    const snapshot = movement.toJSON();
    expect(snapshot).toMatchObject({
      id: 'movement-1',
      type: MovementType.EXPENSE,
      userId: 'user-1',
    });
    expect(snapshot.tags).not.toBe(movement.tags);
  });

  it('normalizes immutable updates via helper methods', () => {
    const movement = Movement.create(buildMovementProps());

    const updated = movement
      .withDescription('  New Description ')
      .withAmount(100)
      .withTags([
        { id: 'tag-2', name: 'Luxo' },
        { id: 'tag-3', name: 'Lazer' },
        { id: 'tag-3', name: 'LAZER' },
      ]);

    expect(updated.description).toBe('New Description');
    expect(updated.amount).toBe(100);
    expect(updated.tagIds).toEqual(['tag-2', 'tag-3']);
    expect(updated.tags).toEqual([
      { id: 'tag-2', name: 'luxo' },
      { id: 'tag-3', name: 'lazer' },
    ]);
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

    expect(() =>
      Movement.create(
        buildMovementProps({
          tags: [{ id: '', name: 'assinatura' }],
        }),
      ),
    ).toThrow('Movement tags must have an id');
  });
});
