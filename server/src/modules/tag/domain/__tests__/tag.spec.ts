import { Tag, type TagProps } from '../entities/tag';

const buildTagProps = (overrides: Partial<TagProps> = {}): TagProps => ({
  id: 'tag-1',
  name: 'assinatura',
  userId: 'user-1',
  createdAt: new Date('2025-01-02T10:00:00Z'),
  ...overrides,
});

describe('Tag Domain Entity', () => {
  it('normalizes the tag name on creation', () => {
    const tag = Tag.create(buildTagProps({ name: '  AssinATURA  ' }));

    expect(tag.name).toBe('assinatura');
    expect(tag.toJSON()).toMatchObject({
      id: 'tag-1',
      name: 'assinatura',
      userId: 'user-1',
    });
  });

  it('rejects invalid tag names', () => {
    expect(() => Tag.create(buildTagProps({ name: '' }))).toThrow(
      'Tag name is required',
    );

    expect(() => Tag.create(buildTagProps({ name: 'Invalid Name' }))).toThrow(
      'Tag name must contain only lowercase letters and numbers',
    );
  });

  it('throws when createdAt is invalid', () => {
    expect(() =>
      Tag.create(
        buildTagProps({
          createdAt: new Date('invalid'),
        }),
      ),
    ).toThrow('Tag createdAt must be a valid Date instance');
  });
});
