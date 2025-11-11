import {
  CreateRefreshTokenProps,
  RefreshToken,
} from '../entities/refresh-token';

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenProps): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  replace(
    currentId: string,
    replacement: CreateRefreshTokenProps,
  ): Promise<RefreshToken>;
  markRevoked(id: string, revokedAt: Date): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export const RefreshTokenRepositoryToken = Symbol(
  'RefreshTokenRepositoryToken',
);
