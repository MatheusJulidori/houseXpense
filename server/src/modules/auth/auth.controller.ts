import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogMethod } from '../../decorators/log.decorator';
import { JwtAuthGuard } from '../../utils/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {
    this.logger.log('AuthController initialized');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthTokenResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  @LogMethod('info')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthTokenResponseDto> {
    this.logger.log(
      `Register: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    const result = await this.authService.register(registerDto);
    this.logger.log(
      `Register success: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    return plainToInstance(AuthTokenResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @LogMethod('info')
  async login(@Body() loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    this.logger.log(`Login: ${loginDto.username}`);
    const result = await this.authService.login(loginDto);
    this.logger.log(`Login success: ${loginDto.username}`);
    return plainToInstance(AuthTokenResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user returned',
    type: CurrentUserResponseDto,
  })
  @LogMethod('info')
  async me(
    @Request() req: { user: { userId: string } },
  ): Promise<CurrentUserResponseDto> {
    const user = await this.authService.validateUser(req.user.userId);
    return plainToInstance(CurrentUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
