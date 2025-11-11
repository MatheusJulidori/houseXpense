export interface TagProps {
  id: string;
  name: string;
  createdAt: Date;
}

export class Tag {
  private constructor(private readonly props: TagProps) {
    this.validate(props);
  }

  static normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  static create(props: TagProps): Tag {
    return new Tag({
      ...props,
      name: Tag.normalizeName(props.name),
    });
  }

  private validate(props: TagProps): void {
    if (!props.id) {
      throw new Error('Tag id is required');
    }
    if (!props.name.trim()) {
      throw new Error('Tag name is required');
    }
    if (!/^[a-z0-9]+$/.test(props.name.trim().toLowerCase())) {
      throw new Error(
        'Tag name must contain only lowercase letters and numbers',
      );
    }
    if (
      !(props.createdAt instanceof Date) ||
      Number.isNaN(props.createdAt.getTime())
    ) {
      throw new Error('Tag createdAt must be a valid Date instance');
    }
  }

  toJSON(): TagProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
