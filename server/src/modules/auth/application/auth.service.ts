import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserOrmEntity } from '../infrastructure/entities/user.orm-entity';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';
import { LogMethod } from '../../../decorators/log.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private userRepository: Repository<UserOrmEntity>,
    private jwtService: JwtService,
  ) {
    this.logger.log('AuthService initialized');
  }

  @LogMethod('info')
  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const { firstName, lastName, password } = registerDto;

    this.logger.debug(
      `Starting user registration for: ${firstName} ${lastName}`,
    );

    // Generate username from firstName + lastName (lowercase, no spaces)
    const username = `${firstName}${lastName}`
      .toLowerCase()
      .replace(/\s+/g, '');

    this.logger.debug(`Generated username: ${username}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Username ${username} already exists`,
      );
      throw new ConflictException('User with this username already exists');
    }

    this.logger.debug('Username is available, proceeding with registration');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.debug('Password hashed successfully');

    // Create user
    const user = this.userRepository.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    this.logger.log(`User created successfully with ID: ${user.id}`);

    // Generate JWT token (365 days expiration)
    const payload = { sub: user.id, username: user.username };
    const access_token = this.jwtService.sign(payload);
    this.logger.debug('JWT token generated successfully');

    return { access_token };
  }

  @LogMethod('info')
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { username, password } = loginDto;

    this.logger.debug(`Login attempt for username: ${username}`);

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      this.logger.warn(`Login failed: User ${username} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug(
      `User found: ${user.firstName} ${user.lastName} (ID: ${user.id})`,
    );

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug('Password validation successful');

    const payload = { sub: user.id, username: user.username };
    const access_token = this.jwtService.sign(payload);
    this.logger.debug('JWT token generated successfully');

    this.logger.log(`Login successful for user: ${username} (ID: ${user.id})`);
    return { access_token };
  }

  @LogMethod('debug')
  async validateUser(userId: string): Promise<UserOrmEntity> {
    this.logger.debug(`Validating user with ID: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User validation failed: User ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(
      `User validation successful: ${user.username} (ID: ${user.id})`,
    );
    return user;
  }
}
