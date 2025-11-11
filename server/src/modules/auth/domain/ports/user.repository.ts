export interface UserRepository {
  findById(id: string): Promise<{ id: string } | null>;
}

export const UserRepositoryToken = Symbol('UserRepositoryToken');
