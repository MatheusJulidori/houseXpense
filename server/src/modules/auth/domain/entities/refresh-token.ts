export interface RefreshTokenProps {
  id: string;
  userId: string;
  hashedToken: string;
  hashedCsrfToken: string;
  expiresAt: Date;
  revokedAt: Date | null;
  rotatedAt: Date | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefreshTokenProps {
  id: string;
  userId: string;
  hashedToken: string;
  hashedCsrfToken: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export class RefreshToken {
  private constructor(private readonly props: RefreshTokenProps) {
    this.validate(props);
  }

  static create(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  private validate(props: RefreshTokenProps): void {
    if (!props.id) {
      throw new Error('Refresh token id is required');
    }
    if (!props.userId) {
      throw new Error('Refresh token userId is required');
    }
    if (!props.hashedToken) {
      throw new Error('Refresh token hash is required');
    }
    if (!props.hashedCsrfToken) {
      throw new Error('CSRF token hash is required');
    }
    if (!(props.expiresAt instanceof Date)) {
      throw new Error('expiresAt must be a valid Date');
    }
    if (!(props.createdAt instanceof Date)) {
      throw new Error('createdAt must be a valid Date');
    }
    if (!(props.updatedAt instanceof Date)) {
      throw new Error('updatedAt must be a valid Date');
    }
  }

  toJSON(): RefreshTokenProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get hashedToken(): string {
    return this.props.hashedToken;
  }

  get hashedCsrfToken(): string {
    return this.props.hashedCsrfToken;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  get rotatedAt(): Date | null {
    return this.props.rotatedAt;
  }

  get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  get ipAddress(): string | null | undefined {
    return this.props.ipAddress;
  }
}
