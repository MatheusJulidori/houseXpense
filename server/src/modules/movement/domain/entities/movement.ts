import {
  MovementType,
  isValidMovementType,
} from '../value-objects/movement-type';

export interface MovementTagSnapshot {
  id: string;
  name: string;
}

export interface MovementProps {
  id: string;
  type: MovementType;
  date: Date;
  description: string;
  amount: number;
  userId: string;
  tags: MovementTagSnapshot[];
  createdAt: Date;
}

export class Movement {
  private constructor(private readonly props: MovementProps) {
    this.validate(props);
  }

  static create(props: MovementProps): Movement {
    return new Movement({
      ...props,
      description: props.description.trim(),
      amount: Number(props.amount),
      tags: Movement.normalizeTags(props.tags),
    });
  }

  private validate(props: MovementProps): void {
    if (!props.id) {
      throw new Error('Movement id is required');
    }
    if (!isValidMovementType(props.type)) {
      throw new Error(`Invalid movement type: ${String(props.type)}`);
    }
    if (!(props.date instanceof Date) || Number.isNaN(props.date.getTime())) {
      throw new Error('Movement date must be a valid Date instance');
    }
    if (!props.description.trim()) {
      throw new Error('Movement description is required');
    }
    if (Number.isNaN(props.amount) || props.amount < 0) {
      throw new Error('Movement amount must be a positive number');
    }
    if (!props.userId) {
      throw new Error('Movement userId is required');
    }
    if (!Array.isArray(props.tags)) {
      throw new Error('Movement tags must be an array');
    }
    for (const tag of props.tags) {
      if (!tag.id) {
        throw new Error('Movement tags must have an id');
      }
      if (!tag.name.trim()) {
        throw new Error('Movement tags must have a name');
      }
    }
    if (
      !(props.createdAt instanceof Date) ||
      Number.isNaN(props.createdAt.getTime())
    ) {
      throw new Error('Movement createdAt must be a valid Date instance');
    }
  }

  toJSON(): MovementProps {
    return {
      ...this.props,
      tags: this.props.tags.map((tag) => ({ ...tag })),
    };
  }

  withTags(tags: MovementTagSnapshot[]): Movement {
    return Movement.create({
      ...this.props,
      tags: Movement.normalizeTags(tags),
    });
  }

  private static normalizeTags(
    tags: MovementTagSnapshot[],
  ): MovementTagSnapshot[] {
    const byId = new Map<string, MovementTagSnapshot>();
    for (const tag of tags) {
      if (!tag.id) {
        throw new Error('Movement tags must have an id');
      }
      const normalizedName = tag.name.trim().toLowerCase();
      if (!normalizedName) {
        throw new Error('Movement tags must have a name');
      }
      byId.set(tag.id, {
        id: tag.id,
        name: normalizedName,
      });
    }
    return Array.from(byId.values());
  }

  withDescription(description: string): Movement {
    return Movement.create({
      ...this.props,
      description,
    });
  }

  withAmount(amount: number): Movement {
    return Movement.create({
      ...this.props,
      amount,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get date(): Date {
    return this.props.date;
  }

  get description(): string {
    return this.props.description;
  }

  get amount(): number {
    return this.props.amount;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tagIds(): string[] {
    return this.props.tags.map((tag) => tag.id);
  }

  get tags(): MovementTagSnapshot[] {
    return this.props.tags.map((tag) => ({ ...tag }));
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
