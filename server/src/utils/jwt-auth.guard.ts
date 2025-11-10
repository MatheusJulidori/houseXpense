import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface UserPayload {
  userId: string;
  username: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserPayload>(
    err: Error | null,
    user: UserPayload | null,
    info: Error | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
  ): TUser {
    if (info) {
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token expired');
      }
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid JWT token');
      }
      throw new UnauthorizedException('Authentication failed');
    }

    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return user as TUser;
  }
}
