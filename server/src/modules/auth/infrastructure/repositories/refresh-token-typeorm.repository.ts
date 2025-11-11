import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RefreshTokenRepository } from '../../domain/ports/refresh-token.repository';
import {
  CreateRefreshTokenProps,
  RefreshToken,
} from '../../domain/entities/refresh-token';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';

@Injectable()
export class RefreshTokenTypeormRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(entity: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.create({
      id: entity.id,
      userId: entity.userId,
      hashedToken: entity.hashedToken,
      hashedCsrfToken: entity.hashedCsrfToken,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      rotatedAt: entity.rotatedAt,
      userAgent: entity.userAgent ?? null,
      ipAddress: entity.ipAddress ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  async create(data: CreateRefreshTokenProps): Promise<RefreshToken> {
    const entity = this.refreshTokenRepository.create({
      id: data.id,
      userId: data.userId,
      hashedToken: data.hashedToken,
      hashedCsrfToken: data.hashedCsrfToken,
      expiresAt: data.expiresAt,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
    });

    const saved = await this.refreshTokenRepository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const token = await this.refreshTokenRepository.findOne({ where: { id } });
    return token ? this.toDomain(token) : null;
  }

  async replace(
    currentId: string,
    replacement: CreateRefreshTokenProps,
  ): Promise<RefreshToken> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshTokenOrmEntity);

      const existing = await repo.findOne({ where: { id: currentId } });
      if (!existing) {
        throw new NotFoundException('Refresh token not found');
      }

      const now = new Date();
      existing.revokedAt = now;
      existing.rotatedAt = now;
      await repo.save(existing);

      const newEntity = repo.create({
        id: replacement.id,
        userId: replacement.userId,
        hashedToken: replacement.hashedToken,
        hashedCsrfToken: replacement.hashedCsrfToken,
        expiresAt: replacement.expiresAt,
        userAgent: replacement.userAgent ?? null,
        ipAddress: replacement.ipAddress ?? null,
      });

      const saved = await repo.save(newEntity);
      return this.toDomain(saved);
    });
  }

  async markRevoked(id: string, revokedAt: Date): Promise<void> {
    await this.refreshTokenRepository.update(
      { id, revokedAt: IsNull() },
      { revokedAt, updatedAt: revokedAt },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: now, updatedAt: now },
    );
  }
}
